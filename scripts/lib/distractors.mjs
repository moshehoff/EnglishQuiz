import { DISTRACTOR_PROFILES } from './categories.mjs'

const PREPOSITIONS = ['in', 'on', 'at', 'by', 'for', 'to', 'from', 'with', 'during', 'since']
const ARTICLES = ['a', 'an', 'the']
const MODALS = ['should', 'must', 'might', 'can', 'could', 'will', 'would', "don't have to", 'have to']
const RELATIVES = ['who', 'which', 'that', 'where', 'when', 'whose']
const AUX_DO = ['do', 'does', 'did', "don't", "doesn't", "didn't"]
const THERE_FORMS = ['There is', 'There are', 'Is there', 'Are there', 'Was there', 'Were there']

function norm(s) {
  return s.replace(/\u2019/g, "'").trim().toLowerCase()
}

function uniq(arr) {
  const seen = new Set()
  return arr.filter((x) => {
    const k = norm(x)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Morph helpers for verb phrases */
function presentSimpleNegativeVariants(answer) {
  const m = answer.match(/^(don't|doesn't|didn't)\s+(.+)$/i)
  if (!m) return []
  const verb = m[2]
  return uniq([
    `don't ${verb}`,
    `doesn't ${verb}`,
    `didn't ${verb}`,
    `not ${verb}`,
    verb,
    `${verb}s`,
    `is ${verb}ing`,
    `was ${verb}ing`,
  ])
}

function presentSimpleVariants(base) {
  if (/\s/.test(base)) {
    if (/^(don't|doesn't|didn't)\s/i.test(base)) {
      return presentSimpleNegativeVariants(base)
    }
    if (/^(have|has|had)\s/i.test(base)) {
      return presentPerfectVariants(base)
    }
    return []
  }
  const b = base.replace(/s$/, '').replace(/es$/, '').replace(/ies$/, 'y')
  return uniq([
    `${b}s`,
    `${b}es`,
    `${b}ing`,
    `${b}ed`,
    `don't ${b}`,
    `doesn't ${b}`,
  ])
}

function pastContinuousVariants(part) {
  const m = part.match(/^(was|were|is|are|am)\s+(\w+?)ing$/i)
  if (!m) {
    return uniq([
      part.replace(/ing$/, 'ed'),
      part.replace(/ing$/, ''),
      `is ${part.replace(/^(was|were|is|are|am)\s+/i, '')}`,
      `are ${part.replace(/^(was|were|is|are|am)\s+/i, '')}`,
      `was ${part.replace(/^(was|were|is|are|am)\s+/i, '')}`,
    ])
  }
  const [, aux, stem] = m
  const otherAux = { was: 'were', were: 'was', is: 'are', are: 'is', am: 'is' }[aux.toLowerCase()] ?? 'was'
  return uniq([
    `${otherAux} ${stem}ing`,
    `${aux} ${stem}`,
    `${aux} ${stem}ed`,
    `is ${stem}ing`,
    `are ${stem}ing`,
    `was ${stem}ing`,
    `${aux} ${stem}s`,
    `will be ${stem}ing`,
  ])
}

function presentPerfectVariants(answer) {
  const parts = []
  const hasNever = /never/.test(answer)
  const hasAlready = /already/.test(answer)
  const hasJust = /just/.test(answer)
  const hasNot = /not|n't/.test(answer)

  if (hasNever) {
    parts.push(
      answer.replace(/have never/, 'has never'),
      answer.replace(/have never/, 'never'),
      answer.replace(/have never/, 'had never'),
      answer.replace(/have never/, 'have ever'),
      answer.replace(/have never been/, 'was never'),
      answer.replace(/have never/, 'have not'),
    )
  } else if (hasAlready) {
    parts.push(
      answer.replace(/^has /, 'have '),
      answer.replace(/already /, ''),
      answer.replace(/have already/, 'has already'),
      answer.replace(/finished/, 'finish'),
      answer.replace(/finished/, 'finishing'),
      answer.replace(/have already/, 'had already'),
    )
  } else if (hasJust) {
    parts.push(
      answer.replace(/^has /, 'have '),
      answer.replace(/just /, 'already '),
      answer.replace(/just /, 'yet '),
      answer.replace(/have just/, 'has just'),
      answer.replace(/have just/, 'had just'),
      answer.replace(/arrived/, 'arrive'),
    )
  } else if (hasNot) {
    parts.push(
      answer.replace(/^have /, 'has '),
      answer.replace(/not /, ''),
      answer.replace(/haven't/, "hasn't"),
      answer.replace(/haven't/, "don't"),
      answer.replace(/seen/, 'see'),
      answer.replace(/seen/, 'saw'),
    )
  } else if (/^have /.test(answer)) {
    parts.push(
      answer.replace(/^have /, 'has '),
      answer.replace(/^have /, 'had '),
      answer.replace(/lived/, 'live'),
      answer.replace(/lived/, 'living'),
      answer.replace(/known/, 'know'),
      answer.replace(/seen/, 'saw'),
    )
  } else if (/^has /.test(answer)) {
    parts.push(
      answer.replace(/^has /, 'have '),
      answer.replace(/^has /, 'had '),
      answer.replace(/n't/, ''),
      answer.replace(/seen/, 'see'),
    )
  }
  return uniq(parts.length ? parts : [answer])
}

function passiveVariants(answer) {
  const parts = [
    answer.replace(/^was /, 'is '),
    answer.replace(/^was /, 'were '),
    answer.replace(/^was /, 'has been '),
    answer.replace(/^is /, 'was '),
    answer.replace(/^is /, 'were '),
    answer.replace(/ made$/, ' makes'),
    answer.replace(/ made$/, ' make'),
    answer.replace(/ spoken$/, ' speaks'),
    answer.replace(/ spoken$/, ' speak'),
    answer.replace(/ built$/, ' builds'),
    answer.replace(/ built$/, ' build'),
    answer.replace(/ sent$/, ' sends'),
    answer.replace(/ served$/, ' serves'),
    answer.replace(/ served$/, ' serve'),
  ]
  const m = answer.match(/^(was|is|are|were)\s+(\S+)$/i)
  if (m) {
    const [, aux, verb] = m
    const alt = aux.toLowerCase() === 'was' ? 'is' : 'was'
    parts.push(`${alt} ${verb}`, `${aux} ${verb.replace(/ed$/, '')}`, `${aux} ${verb.replace(/en$/, 'ed')}`)
  }
  return uniq(parts)
}

function conditionalVariants(answer) {
  return uniq([
    answer,
    answer.replace(/^won$/, 'win'),
    answer.replace(/^won$/, 'wins'),
    answer.replace(/^won$/, 'would win'),
    answer.replace(/^won$/, 'will win'),
    answer.replace(/^won$/, 'had won'),
    answer.replace(/will stay/, 'stay'),
    answer.replace(/will stay/, 'stayed'),
    answer.replace(/will stay/, 'would stay'),
    answer.replace(/will stay/, 'are staying'),
    answer.replace(/study$/, 'studied'),
    answer.replace(/study$/, 'will study'),
    answer.replace(/study$/, 'studying'),
    answer.replace(/would not buy/, 'will not buy'),
    answer.replace(/would not buy/, "don't buy"),
    answer.replace(/would not buy/, 'did not buy'),
    answer.replace(/would not buy/, 'not buy'),
    answer.replace(/don't hurry/, "doesn't hurry"),
    answer.replace(/don't hurry/, "didn't hurry"),
    answer.replace(/don't hurry/, 'not hurry'),
    answer.replace(/don't hurry/, "won't hurry"),
  ])
}

function comparativeVariants(answer) {
  return uniq([
    answer,
    answer.replace(/more expensive/, 'expensive'),
    answer.replace(/more expensive/, 'most expensive'),
    answer.replace(/more expensive/, 'expensiver'),
    answer.replace(/more difficult/, 'difficult'),
    answer.replace(/more difficult/, 'most difficult'),
    answer.replace(/taller/, 'tall'),
    answer.replace(/taller/, 'tallest'),
    answer.replace(/worst/, 'bad'),
    answer.replace(/worst/, 'worse'),
    answer.replace(/worst/, 'best'),
    answer.replace(/best/, 'good'),
    answer.replace(/best/, 'better'),
    answer.replace(/best/, 'worst'),
    answer.replace(/tallest/, 'tall'),
    answer.replace(/tallest/, 'taller'),
  ])
}

function gerundInfinitiveVariants(answer) {
  if (/^to \w+/.test(answer)) {
    const v = answer.replace(/^to /, '')
    const stem = v.replace(/e$/, '')
    return uniq([
      v,
      `${v}s`,
      `${stem}ing`,
      `${v}ed`,
      `for ${v}`,
      `${stem}ing`,
      `will ${v}`,
    ])
  }
  const base = answer.replace(/ing$/, '').replace(/e$/, '')
  return uniq([
    answer.replace(/ing$/, ''),
    `to ${answer.replace(/ing$/, '')}`,
    `${base}ing`,
    `${base}ed`,
    `${base}s`,
    `will ${base}`,
  ])
}

function dualAnswerVariants(answer) {
  const parts = answer.split(/\s*\/\s*/).map((p) => p.trim())
  if (parts.length !== 2) return [answer]

  const pool1 = generatePartDistractors(parts[0], true)
  const pool2 = generatePartDistractors(parts[1], true)
  const out = []

  // Vary second part only (first stays correct)
  for (const b of pool2) {
    if (norm(b) !== norm(parts[1])) out.push(`${parts[0]} / ${b}`)
  }
  // Vary first part only (second stays correct)
  for (const a of pool1) {
    if (norm(a) !== norm(parts[0])) out.push(`${a} / ${parts[1]}`)
  }
  // Vary both
  for (const a of pool1) {
    for (const b of pool2) {
      if (norm(a) === norm(parts[0]) && norm(b) === norm(parts[1])) continue
      out.push(`${a} / ${b}`)
    }
  }
  return uniq(out)
}

function generatePartDistractors(part, includeSelf = false) {
  const p = part.trim()
  if (PREPOSITIONS.includes(norm(p))) {
    const pool = includeSelf ? [...PREPOSITIONS] : PREPOSITIONS.filter((x) => norm(x) !== norm(p))
    return pool
  }
  if (AUX_DO.includes(norm(p))) {
    return includeSelf ? [...AUX_DO] : AUX_DO.filter((x) => norm(x) !== norm(p))
  }
  if (/^(was|were|is|are|am)\s+\w+ing$/i.test(p)) {
    const variants = pastContinuousVariants(p)
    return includeSelf ? uniq([p, ...variants]) : variants.filter((x) => norm(x) !== norm(p))
  }
  if (/^(do|does|did)$/i.test(p)) {
    const pool = ['do', 'does', 'did', 'is', 'are', 'was']
    return includeSelf ? pool : pool.filter((x) => norm(x) !== norm(p))
  }
  const variants = presentSimpleVariants(p)
  return includeSelf ? uniq([p, ...variants]) : variants.filter((x) => norm(x) !== norm(p))
}

function detectType(answer, category) {
  const a = answer.trim()
  const n = norm(a)

  if (/\s*\/\s*/.test(a)) return 'dual'
  if (DISTRACTOR_PROFILES[category]?.length) return 'profile'
  if (PREPOSITIONS.includes(n)) return 'preposition'
  if (ARTICLES.includes(n)) return 'article'
  if (MODALS.includes(n) || MODALS.some((m) => n.includes(norm(m)))) return 'modal'
  if (RELATIVES.includes(n)) return 'relative'
  if (/^(who|which|that|where|when)$/i.test(a)) return 'relative'
  if (/^(there is|there are|is there|are there)/i.test(a)) return 'there'
  if (/^(don't|doesn't|didn't)\s/.test(a)) return 'present_simple_negative'
  if (/^(was|were|is|are|am)\s+\w+ing$/i.test(a)) return 'past_continuous'
  if (/^(have|has)\s/.test(a)) return 'present_perfect'
  if (/^(was|were)\s+\w+ed$/i.test(a) || /^(was|were)\s+\w+[^e]ed$/i.test(a)) return 'passive'
  if (/^(is|are)\s+\w+/i.test(a) && /spoken|served|made|built/i.test(a)) return 'passive'
  if (/^will\s|^would\s|^won$|^would not|^don't hurry/i.test(a) || category.includes('conditional')) return 'conditional'
  if (/^(more |better|best|worst|taller|tallest|-er)/i.test(a) || category.includes('comparative') || category.includes('superlative')) return 'comparative'
  if (/ing$/.test(a) && !/^(is|are|was|were|am)\s/.test(a)) return 'gerund'
  if (/^to\s/.test(a)) return 'infinitive'
  if (/^(myself|yourself|himself|herself|itself|ourselves|themselves)$/i.test(a)) return 'reflexive'
  if (/^(in|on|at|by|for|to|since)$/i.test(a)) return 'preposition'
  if (/^(a|an|the)$/i.test(a)) return 'article'
  if (/^(many|much|few|little|some|any)$/i.test(a)) return 'quantifier'
  if (/ly$/.test(a)) return 'adverb'
  if (/^(well|good|bad|loud|quick|careful)$/i.test(a)) return 'adj_adv'
  if (/^(too|enough|so)$/i.test(a)) return 'too_enough'
  if (/^(so that|because|to|in order to)$/i.test(a)) return 'purpose'
  return 'verb'
}

export function generateDistractors(answer, category, count = 5) {
  const correct = answer.trim()
  const type = detectType(correct, category)
  let pool = []

  switch (type) {
    case 'profile':
      pool = [...(DISTRACTOR_PROFILES[category] ?? [])]
      break
    case 'dual':
      pool = dualAnswerVariants(correct)
      break
    case 'preposition':
      pool = PREPOSITIONS.filter((p) => norm(p) !== norm(correct))
      break
    case 'article':
      pool = ARTICLES.filter((p) => norm(p) !== norm(correct))
      break
    case 'modal':
      pool = MODALS.filter((p) => norm(p) !== norm(correct))
      break
    case 'relative':
      pool = RELATIVES.filter((p) => norm(p) !== norm(correct))
      break
    case 'there':
      pool = THERE_FORMS.filter((p) => norm(p) !== norm(correct))
      break
    case 'present_perfect':
      pool = presentPerfectVariants(correct)
      break
    case 'passive':
      pool = passiveVariants(correct)
      break
    case 'past_continuous':
      pool = pastContinuousVariants(correct)
      break
    case 'conditional':
      pool = conditionalVariants(correct)
      break
    case 'comparative':
      pool = comparativeVariants(correct)
      break
    case 'gerund':
    case 'infinitive':
      pool = gerundInfinitiveVariants(correct)
      break
    case 'reflexive':
      pool = ['myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves'].filter(
        (p) => norm(p) !== norm(correct),
      )
      break
    case 'quantifier':
      pool = ['many', 'much', 'few', 'little', 'some', 'any'].filter((p) => norm(p) !== norm(correct))
      break
    case 'adverb':
      pool = ['well', 'good', 'quickly', 'quick', 'carefully', 'careful', 'loudly', 'loud', 'badly', 'bad']
      break
    case 'adj_adv':
      pool = ['well', 'good', 'badly', 'bad', 'loudly', 'loud', 'quickly', 'quick']
      break
    case 'too_enough':
      pool = ['too', 'enough', 'so', 'very', 'also', 'much']
      break
    case 'purpose':
      pool = ['to', 'for', 'so that', 'because', 'in order to', 'and']
      break
    case 'present_simple_negative':
      pool = presentSimpleNegativeVariants(correct)
      break
    case 'aux':
      pool = ['do', 'does', 'did', "don't", "doesn't", "didn't", 'is', 'are', 'was', 'were', 'have', 'has']
      break
    default:
      pool = presentSimpleVariants(correct)
  }

  if (type === 'profile' && pool.length < count) {
    const extra = generateDistractors(correct, 'general', count)
    pool = uniq([...pool, ...extra])
  }

  pool = uniq(pool.filter((x) => norm(x) !== norm(correct) && x.length > 0 && x !== '—'))

  if (pool.length < count) {
    const extra = presentSimpleVariants(correct).filter((x) => norm(x) !== norm(correct))
    pool = uniq([...pool, ...extra])
  }

  // Last-resort: tense/auxiliary swaps for multi-word answers
  if (pool.length < count && /\s/.test(correct)) {
    const swaps = [
      correct.replace(/^have /, 'has '),
      correct.replace(/^has /, 'have '),
      correct.replace(/^is /, 'are '),
      correct.replace(/^are /, 'is '),
      correct.replace(/^was /, 'is '),
      correct.replace(/^will /, 'would '),
      correct.replace(/^am /, 'is '),
      correct.replace(/ing$/, 'ed'),
      correct.replace(/ed$/, 'ing'),
    ]
    pool = uniq([...pool, ...swaps.filter((x) => norm(x) !== norm(correct))])
  }

  return pool.slice(0, Math.max(count, pool.length))
}

export function buildOptions(correct, category) {
  let distractors = generateDistractors(correct, category, 10)
  distractors = uniq(distractors.filter((x) => norm(x) !== norm(correct)))

  if (distractors.length < 5 && DISTRACTOR_PROFILES[category]) {
    for (const p of DISTRACTOR_PROFILES[category]) {
      if (distractors.length >= 5) break
      if (norm(p) !== norm(correct) && !distractors.some((d) => norm(d) === norm(p))) {
        distractors.push(p)
      }
    }
  }

  distractors = distractors.slice(0, 5)
  let options = uniq([correct, ...distractors])

  if (options.length < 6 && DISTRACTOR_PROFILES[category]) {
    for (const p of DISTRACTOR_PROFILES[category]) {
      if (options.length >= 6) break
      if (norm(p) !== norm(correct) && !options.some((o) => norm(o) === norm(p))) {
        options.push(p)
      }
    }
  }

  if (options.length < 6) {
    const generic = [
      correct.replace(/^is /, 'are '),
      correct.replace(/^are /, 'is '),
      correct.replace(/^was /, 'is '),
      correct.replace(/^have /, 'has '),
      correct.replace(/^has /, 'have '),
      correct.replace(/ed$/, 'ing'),
      correct.replace(/ing$/, 'ed'),
      correct.replace(/s$/, ''),
    ]
    for (const g of generic) {
      if (options.length >= 6) break
      if (g && norm(g) !== norm(correct) && !options.some((o) => norm(o) === norm(g))) {
        options.push(g)
      }
    }
  }

  if (options.length < 6) {
    console.warn(`Only ${options.length} options for "${correct}" (${category})`)
    const pad = ['have lived', 'has lived', 'had lived', 'was', 'were', 'is', 'are', 'will', 'would']
    for (const p of pad) {
      if (options.length >= 6) break
      if (norm(p) !== norm(correct) && !options.some((o) => norm(o) === norm(p))) options.push(p)
    }
  }

  while (options.length < 6) {
    options.push(`not ${correct}`)
  }

  const final = options.slice(0, 6)
  const shuffled = shuffleOptions(final)
  const correctIndex = shuffled.findIndex((o) => norm(o) === norm(correct))
  return { options: shuffled, correctIndex: correctIndex >= 0 ? correctIndex : 0 }
}

function shuffleOptions(options) {
  const shuffled = [...options]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
