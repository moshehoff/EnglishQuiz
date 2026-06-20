import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { labelToCategory } from './lib/categories.mjs'
import { buildOptions } from './lib/distractors.mjs'
import { HEBREW_EXPLANATIONS } from './lib/hebrew-explanations.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const MORE = path.join(ROOT, 'data', 'more')
const ENGLISH = path.join(ROOT, 'data')
const OUT_Q = path.join(ROOT, 'public', 'questions.json')
const OUT_E = path.join(ROOT, 'public', 'explanations.json')

const BLANK = '__________'

function readFile(p) {
  return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
}

function normalizeApostrophe(s) {
  return s.replace(/\u2019/g, "'").trim()
}

/** Remove (hints) from question text */
function stripHints(text) {
  return text.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()
}

/** Convert underscore runs to single blank token */
function toPrompt(raw) {
  let t = stripHints(raw)
  t = t.replace(/_{3,}/g, BLANK)
  t = t.replace(/\s+/g, ' ').trim()
  return t
}

function parseQuestions(md) {
  const items = []
  const lines = md.split('\n')
  for (const line of lines) {
    const m = line.match(/^\d+\.\s*(.+)$/)
    if (!m) continue
    const body = m[1].trim()
    if (!/_{3,}/.test(body)) continue
    items.push(toPrompt(body))
  }
  return items
}

function extractAnswerFromLine(line) {
  const bold = [...line.matchAll(/\*\*([^*]+)\*\*/g)].map((x) => x[1].trim())
  if (bold.length >= 2) {
    return bold.map(normalizeApostrophe).join(' / ')
  }
  if (bold.length === 1) {
    return normalizeApostrophe(bold[0])
  }
  const plain = line.replace(/^\d+\.\s*/, '').trim()
  if (plain && !plain.startsWith('**')) {
    return normalizeApostrophe(plain)
  }
  return null
}

function parseAnswerKey(md) {
  const items = []
  const blocks = md.split(/\n(?=\d+\.)/)
  for (const block of blocks) {
    const numMatch = block.match(/^(\d+)\.\s*(.*)/s)
    if (!numMatch) continue
    const rest = numMatch[2]
    const firstLine = rest.split('\n')[0]
    const answer = extractAnswerFromLine(`${numMatch[1]}. ${firstLine}`)
    if (!answer) continue

    const labelMatch = block.match(/\*\*הסבר:\*\*\s*(.+)/)
    const label = labelMatch ? labelMatch[1].trim() : ''
    const exampleMatch = block.match(/\*\*דוגמה(?:\s*נוספת)?:\*\*\s*(.+)/)
    const example = exampleMatch ? exampleMatch[1].trim() : ''

    items.push({
      answer: normalizeApostrophe(answer),
      label,
      category: labelToCategory(label),
      example,
    })
  }
  return items
}

/** Parse rich answers from C:\projects\english\Worksheet_X_Answers.md */
function parseEnglishAnswers(md) {
  const items = []
  const blocks = md.split(/\n(?=\d+\.\s+\*\*)/)
  for (const block of blocks) {
    const titleMatch = block.match(/^\d+\.\s+\*\*([^*]+)\*\*\s*[–-]\s*(.+?)(?:\n|$)/)
    if (!titleMatch) continue
    const shortTitle = titleMatch[2].trim()
    const examples = [...block.matchAll(/📘\s*\*דוגמה:\*\s*(.+)/g)].map((m) => m[1].trim())
    const explMatch = block.match(/💡\s*\*הסבר נוסף:\*\s*(.+?)(?:\n\n|\n\d+\.|$)/s)
    const explanation = explMatch ? explMatch[1].replace(/\s+/g, ' ').trim() : shortTitle

    // Guess category from explanation keywords
    const category = labelToCategory(explanation + ' ' + shortTitle)

    items.push({
      category,
      title: shortTitle.split(/[.:]/)[0].slice(0, 80),
      explanation,
      examples: examples.slice(0, 2),
    })
  }
  return items
}

function mergeExplanations(fromKeys, fromEnglish) {
  const map = {}

  for (const item of fromKeys) {
    if (!item.category || item.category === 'general') continue
    if (!map[item.category]) {
      map[item.category] = {
        title: item.label || item.category,
        explanation: item.label,
        examples: item.example ? [item.example] : [],
      }
    } else if (item.example && map[item.category].examples.length < 2) {
      if (!map[item.category].examples.includes(item.example)) {
        map[item.category].examples.push(item.example)
      }
    }
  }

  for (const item of fromEnglish) {
    if (!item.category || item.category === 'general') continue
    const existing = map[item.category]
    if (!existing) {
      map[item.category] = {
        title: item.title,
        explanation: item.explanation,
        examples: item.examples,
      }
    } else {
      if (item.explanation.length > (existing.explanation?.length ?? 0)) {
        existing.explanation = item.explanation
      }
      if (item.title && item.title.length > 3) {
        existing.title = item.title
      }
      for (const ex of item.examples) {
        if (existing.examples.length < 2 && !existing.examples.includes(ex)) {
          existing.examples.push(ex)
        }
      }
    }
  }

  // Human-readable titles
  const TITLE_MAP = {
    present_perfect_never: 'Present Perfect — never',
    present_perfect_already: 'Present Perfect — already',
    present_perfect_negative: 'Present Perfect — שלילה עם yet',
    present_perfect_just: 'Present Perfect — just',
    present_perfect_since: 'Present Perfect — since',
    present_perfect_for: 'Present Perfect — for',
    present_perfect_question: 'Present Perfect — שאלה',
    present_perfect: 'Present Perfect',
    past_continuous_dual: 'Past Continuous — שתי פעולות',
    past_continuous_mixed: 'Past Continuous + Past Simple',
    past_continuous: 'Past Continuous',
    second_conditional: 'Second Conditional',
    first_conditional: 'First Conditional',
    first_conditional_negative: 'First Conditional — שלילה',
    past_passive: 'Passive Voice — Past Simple',
    present_passive: 'Passive Voice — Present Simple',
    modal_should: 'Modal — should',
    modal_must: 'Modal — must',
    modal_might: 'Modal — might',
    relative_who: 'Relative Clause — who',
    relative_where: 'Relative Clause — where',
    relative_that: 'Relative Clause — that',
    future_will: 'Future — will',
    future_going_to: 'Future — going to (plans)',
    future_going_to_negative: 'Future — going to שלילה',
    going_to_prediction: 'Going to — prediction',
    superlative: 'Superlative',
    superlative_the: 'Superlative — the',
    gerund_good_at: 'Gerund — good at',
    gerund_after_hate: 'Gerund — after hate/love',
    gerund_interested: 'Gerund — interested in',
    gerund_stop: 'Gerund — after stop',
    infinitive_purpose: 'Infinitive of purpose',
    infinitive_promise: 'Infinitive — after promise',
    prepositions_dual: 'Prepositions — place & time',
    prepositions_at_on: 'Prepositions — at / on',
    preposition_in: 'Prepositions — in',
    preposition_on: 'Prepositions — on',
    preposition_by: 'Prepositions — by',
    preposition_in_time: 'Prepositions — in (time)',
    article_an: 'Articles — a / an / the',
    quantifier_few: 'Quantifiers — few',
    quantifier_many: 'Quantifiers — many',
    quantifier_much: 'Quantifiers — much',
    quantifier_little: 'Quantifiers — little',
    adverb: 'Adverbs',
    adjective: 'Adjectives',
    present_continuous: 'Present Continuous',
    there_were: 'There were',
    there_are: 'There are',
    there_is: 'There is',
    there_question: 'There is / There are — שאלה',
    present_simple_habit: 'Present Simple — הרגל',
    present_simple_question: 'Present Simple — שאלה',
    present_simple_negative: 'Present Simple — שלילה',
    present_simple: 'Present Simple',
    past_simple: 'Past Simple',
    past_simple_question_negative: 'Past Simple — שאלה שלילית',
    past_simple_told: 'Past Simple — tell/told',
    comparative: 'Comparatives',
    too_enough: 'Too / Enough',
    since: 'Since',
    for_duration: 'For — משך זמן',
    so_that: 'So that',
    reflexive: 'Reflexive pronouns',
    dont_have_to: "Don't have to",
    general: 'Grammar',
  }

  for (const [slug, entry] of Object.entries(map)) {
    if (TITLE_MAP[slug]) entry.title = TITLE_MAP[slug]
    if (!entry.examples?.length) entry.examples = []
    if (HEBREW_EXPLANATIONS[slug]) {
      entry.explanation = HEBREW_EXPLANATIONS[slug]
    } else if (!entry.explanation) {
      entry.explanation = entry.title
    }
  }

  return map
}

function loadAllData() {
  const questions = []
  const keyItems = []

  for (let w = 1; w <= 5; w++) {
    const qPath = path.join(MORE, `Worksheet_${w}_Questions.md`)
    const aPath = path.join(MORE, `Answer_Key_Worksheet_${w}.md`)
    const prompts = parseQuestions(readFile(qPath))
    const answers = parseAnswerKey(readFile(aPath))

    if (prompts.length !== answers.length) {
      console.warn(`Worksheet ${w}: ${prompts.length} questions vs ${answers.length} answers`)
    }

    const n = Math.min(prompts.length, answers.length)
    for (let i = 0; i < n; i++) {
      const { answer, category } = answers[i]
      const { options, correctIndex } = buildOptions(answer, category)
      questions.push({
        category,
        prompt: prompts[i],
        options,
        correctIndex,
      })
      keyItems.push(answers[i])
    }
  }

  const englishItems = []
  for (let w = 1; w <= 4; w++) {
    const p = path.join(ENGLISH, `Worksheet_${w}_Answers.md`)
    if (fs.existsSync(p)) {
      englishItems.push(...parseEnglishAnswers(readFile(p)))
    }
  }

  const explanations = mergeExplanations(keyItems, englishItems)
  return { questions, explanations }
}

function validate(questions, explanations) {
  let errors = 0
  for (const q of questions) {
    if (q.options.length !== 6) {
      console.error('Expected 6 options:', q.prompt, q.options.length)
      errors++
    }
  }
  return errors
}

const { questions, explanations } = loadAllData()
const errors = validate(questions, explanations)

fs.mkdirSync(path.dirname(OUT_Q), { recursive: true })
fs.writeFileSync(OUT_Q, JSON.stringify(questions, null, 2), 'utf8')
fs.writeFileSync(OUT_E, JSON.stringify(explanations, null, 2), 'utf8')

console.log(`Wrote ${questions.length} questions → ${OUT_Q}`)
console.log(`Wrote ${Object.keys(explanations).length} explanation categories → ${OUT_E}`)
if (errors) {
  console.error(`${errors} validation error(s)`)
  process.exit(1)
}
