/**
 * Distractor generator — wrong options derived from the correct answer.
 * Includes common Israeli-English mistakes (wrong tense, auxiliary, -s, irregular forms).
 */

const PREPOSITIONS = ['in', 'on', 'at', 'by', 'for', 'to', 'from', 'with', 'during', 'since']
const ARTICLES = ['a', 'an', 'the']
const MODALS = ['should', 'must', 'might', 'can', 'could', 'will', 'would', "don't have to", 'have to']
const RELATIVES = ['who', 'which', 'that', 'where', 'when', 'whose']
const AUX_DO = ['do', 'does', 'did', "don't", "doesn't", "didn't"]
const THERE_FORMS = ['There is', 'There are', 'Is there', 'Are there', 'Was there', 'Were there']

/** base → { s, past, pp, ing } — verbs that appear in the quiz */
const IRREGULAR = {
  be: { s: 'is', past: 'was', pp: 'been', ing: 'being' },
  go: { s: 'goes', past: 'went', pp: 'gone', ing: 'going' },
  do: { s: 'does', past: 'did', pp: 'done', ing: 'doing' },
  make: { s: 'makes', past: 'made', pp: 'made', ing: 'making' },
  eat: { s: 'eats', past: 'ate', pp: 'eaten', ing: 'eating' },
  forget: { s: 'forgets', past: 'forgot', pp: 'forgotten', ing: 'forgetting' },
  wake: { s: 'wakes', past: 'woke', pp: 'woken', ing: 'waking' },
  win: { s: 'wins', past: 'won', pp: 'won', ing: 'winning' },
  study: { s: 'studies', past: 'studied', pp: 'studied', ing: 'studying' },
  play: { s: 'plays', past: 'played', pp: 'played', ing: 'playing' },
  work: { s: 'works', past: 'worked', pp: 'worked', ing: 'working' },
  live: { s: 'lives', past: 'lived', pp: 'lived', ing: 'living' },
  run: { s: 'runs', past: 'ran', pp: 'run', ing: 'running' },
  snow: { s: 'snows', past: 'snowed', pp: 'snowed', ing: 'snowing' },
  stay: { s: 'stays', past: 'stayed', pp: 'stayed', ing: 'staying' },
  buy: { s: 'buys', past: 'bought', pp: 'bought', ing: 'buying' },
  try: { s: 'tries', past: 'tried', pp: 'tried', ing: 'trying' },
  watch: { s: 'watches', past: 'watched', pp: 'watched', ing: 'watching' },
  write: { s: 'writes', past: 'wrote', pp: 'written', ing: 'writing' },
  arrive: { s: 'arrives', past: 'arrived', pp: 'arrived', ing: 'arriving' },
  start: { s: 'starts', past: 'started', pp: 'started', ing: 'starting' },
  finish: { s: 'finishes', past: 'finished', pp: 'finished', ing: 'finishing' },
  help: { s: 'helps', past: 'helped', pp: 'helped', ing: 'helping' },
  visit: { s: 'visits', past: 'visited', pp: 'visited', ing: 'visiting' },
  hurry: { s: 'hurries', past: 'hurried', pp: 'hurried', ing: 'hurrying' },
  speak: { s: 'speaks', past: 'spoke', pp: 'spoken', ing: 'speaking' },
  serve: { s: 'serves', past: 'served', pp: 'served', ing: 'serving' },
  build: { s: 'builds', past: 'built', pp: 'built', ing: 'building' },
  send: { s: 'sends', past: 'sent', pp: 'sent', ing: 'sending' },
  see: { s: 'sees', past: 'saw', pp: 'seen', ing: 'seeing' },
  tell: { s: 'tells', past: 'told', pp: 'told', ing: 'telling' },
  leave: { s: 'leaves', past: 'left', pp: 'left', ing: 'leaving' },
  enjoy: { s: 'enjoys', past: 'enjoyed', pp: 'enjoyed', ing: 'enjoying' },
  call: { s: 'calls', past: 'called', pp: 'called', ing: 'calling' },
  dance: { s: 'dances', past: 'danced', pp: 'danced', ing: 'dancing' },
  learn: { s: 'learns', past: 'learned', pp: 'learned', ing: 'learning' },
  smoke: { s: 'smokes', past: 'smoked', pp: 'smoked', ing: 'smoking' },
  like: { s: 'likes', past: 'liked', pp: 'liked', ing: 'liking' },
  know: { s: 'knows', past: 'knew', pp: 'known', ing: 'knowing' },
  answer: { s: 'answers', past: 'answered', pp: 'answered', ing: 'answering' },
  exercise: { s: 'exercises', past: 'exercised', pp: 'exercised', ing: 'exercising' },
}

function norm(s) {
  return s.replace(/\u2019/g, "'").trim().toLowerCase()
}

function uniq(arr) {
  const seen = new Set()
  return arr.filter((x) => {
    const k = norm(x)
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function thirdPerson(base) {
  if (IRREGULAR[base]) return IRREGULAR[base].s
  if (/[^aeiou]y$/i.test(base)) return base.slice(0, -1) + 'ies'
  if (/s$|x$|z$|ch$|sh$/i.test(base)) return base + 'es'
  return base + 's'
}

function ingForm(base) {
  if (IRREGULAR[base]) return IRREGULAR[base].ing
  if (base.endsWith('e') && !base.endsWith('ee')) return base.slice(0, -1) + 'ing'
  return base + 'ing'
}

function pastForm(base) {
  if (IRREGULAR[base]) return IRREGULAR[base].past
  if (/[^aeiou]y$/i.test(base)) return base.slice(0, -1) + 'ied'
  if (base.endsWith('e')) return base + 'd'
  return base + 'ed'
}

function ppForm(base) {
  if (IRREGULAR[base]) return IRREGULAR[base].pp
  if (/[^aeiou]y$/i.test(base)) return base.slice(0, -1) + 'ied'
  if (base.endsWith('e')) return base + 'd'
  return base + 'ed'
}

/** Guess infinitive from any conjugated form */
function guessBase(word) {
  const w = word.toLowerCase()
  for (const [base, forms] of Object.entries(IRREGULAR)) {
    if ([base, forms.s, forms.past, forms.pp, forms.ing].map(norm).includes(w)) return base
  }
  if (w.endsWith('ies')) return w.slice(0, -3) + 'y'
  if (w.endsWith('ing')) {
    const stem = w.slice(0, -3)
    if (IRREGULAR[stem]) return stem
    if (IRREGULAR[stem + 'e']) return stem + 'e'
    // silent-e: dancing → dance, smoking → smoke
    if (stem.length >= 2) return stem + 'e'
    return stem
  }
  if (w.endsWith('ied')) return w.slice(0, -3) + 'y'
  if (w.endsWith('ed')) {
    const stem = w.slice(0, -2)
    if (IRREGULAR[stem]) return stem
    if (IRREGULAR[stem + 'e']) return stem + 'e'
    return stem
  }
  if (w.endsWith('es')) return w.slice(0, -2)
  if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1)
  return w
}

/** Base form from gerund (dancing → dance) */
function baseFromGerund(answer) {
  const w = answer.trim().toLowerCase()
  for (const [base, forms] of Object.entries(IRREGULAR)) {
    if (norm(forms.ing) === norm(w)) return base
  }
  if (w.endsWith('ing')) return guessBase(w)
  return guessBase(w)
}

/** All morphological + Israeli-mistake variants for a verb base */
function verbMorphVariants(base, particle = '') {
  const b = base.toLowerCase()
  const p = particle ? ` ${particle}` : ''
  const s = thirdPerson(b)
  const ing = ingForm(b)
  const past = pastForm(b)
  const pp = ppForm(b)
  const regularizedPast = b + 'ed'
  const regularizedPp = b + 'ed'

  return uniq([
    // basic forms
    b + p,
    s + p,
    ing + p,
    past + p,
    pp + p,
    // Israeli: missing 3rd-person -s
    b + p,
    // Israeli: wrong tense for habit/fact
    ing + p,
    past + p,
    `is ${ing}${p}`,
    `are ${ing}${p}`,
    `was ${ing}${p}`,
    `will ${b}${p}`,
    // Israeli: don't/doesn't confusion
    `don't ${b}${p}`,
    `don't ${s}${p}`,
    `doesn't ${b}${p}`,
    `doesn't ${s}${p}`,
    `didn't ${b}${p}`,
    // Israeli: do-support errors / wrong auxiliary
    `do ${b}${p}`,
    `does ${b}${p}`,
    `did ${b}${p}`,
    `is ${b}${p}`,
    `are ${b}${p}`,
    `was ${b}${p}`,
    // Israeli: present perfect instead of simple (or wrong participle)
    `have ${pp}${p}`,
    `has ${pp}${p}`,
    `have ${past}${p}`,
    `has ${past}${p}`,
    `had ${pp}${p}`,
    // Israeli: regularized irregular
    regularizedPast + p,
    regularizedPp + p,
    b + 'ed' + p,
    // Israeli: to after modal (stored as phrase elsewhere)
    `to ${b}${p}`,
  ])
}

/** Variants for phrasal verbs: "wakes up", "going to visit" */
function phrasalVariants(answer) {
  const a = answer.trim()
  const m = a.match(/^(\S+)\s+(\S+)$/i)
  if (!m) return verbMorphVariants(guessBase(a))

  const [, verb, particle] = m
  const base = guessBase(verb)
  return verbMorphVariants(base, particle)
}

function presentSimpleNegativeVariants(answer) {
  const m = answer.match(/^(don't|doesn't|didn't)\s+(.+)$/i)
  if (!m) return []
  const [, aux, rest] = m
  const base = guessBase(rest.split(/\s/)[0])
  const particle = rest.includes(' ') ? rest.split(/\s/).slice(1).join(' ') : ''
  const p = particle ? ` ${particle}` : ''
  const s = thirdPerson(base)
  const ing = ingForm(base)

  return uniq([
    // wrong auxiliary (very common in Israel)
    `don't ${base}${p}`,
    `don't ${s}${p}`,
    `doesn't ${base}${p}`,
    `doesn't ${s}${p}`,
    `didn't ${base}${p}`,
    `didn't ${s}${p}`,
    // positive instead of negative
    `${base}${p}`,
    `${s}${p}`,
    // continuous instead of simple negative
    `isn't ${ing}${p}`,
    `aren't ${ing}${p}`,
    `not ${base}${p}`,
    `no ${base}${p}`,
    // Israeli: "is not" instead of doesn't
    `is not ${base}${p}`,
    `is not ${ing}${p}`,
  ])
}

function presentPerfectVariants(answer) {
  const parts = []
  const a = answer.trim()

  // auxiliary swaps (have/has/had — classic Israeli confusion)
  parts.push(
    a.replace(/^have /i, 'has '),
    a.replace(/^have /i, 'had '),
    a.replace(/^has /i, 'have '),
    a.replace(/^has /i, 'had '),
    a.replace(/^had /i, 'have '),
    a.replace(/^had /i, 'has '),
  )

  // Israeli: past simple instead of present perfect
  if (/never/.test(a)) {
    parts.push(
      a.replace(/have never/, 'has never'),
      a.replace(/have never/, 'had never'),
      a.replace(/have never/, 'have ever'),
      a.replace(/never (\w+)/, 'ever $1'),
      a.replace(/have never been/, 'was never'),
      a.replace(/have never been/, 'went never'),
      a.replace(/have never/, "don't never"),
    )
  }
  if (/already/.test(a)) {
    parts.push(
      a.replace(/have already/, 'has already'),
      a.replace(/have already/, 'had already'),
      a.replace(/already /, ''),
      a.replace(/already /, 'yet '),
    )
  }
  if (/just/.test(a)) {
    parts.push(
      a.replace(/have just/, 'has just'),
      a.replace(/have just/, 'had just'),
      a.replace(/just /, 'already '),
      a.replace(/just /, 'yet '),
    )
  }
  if (/not|n't/.test(a)) {
    parts.push(
      a.replace(/^have /i, 'has '),
      a.replace(/haven't/, "hasn't"),
      a.replace(/haven't/, "don't"),
      a.replace(/hasn't/, "haven't"),
      a.replace(/not /, ''),
      a.replace(/not /, 'yet '),
    )
  }

  // Israeli: wrong participle — use past simple after have/has
  const verbMatch = a.match(/(?:have|has|had)\s+(?:never|already|just|not|n't)?\s*(\w+)/i)
  if (verbMatch) {
    const word = verbMatch[1]
    const base = guessBase(word)
    const past = pastForm(base)
    const pp = ppForm(base)
    const baseForm = base
    parts.push(
      a.replace(word, past),
      a.replace(word, baseForm),
      a.replace(word, ingForm(base)),
      a.replace(word, pp + 'ed'),
    )
  }

  // Israeli: was/were instead of have/has
  if (/^have /i.test(a)) parts.push(a.replace(/^have /, 'was '))
  if (/^has /i.test(a)) parts.push(a.replace(/^has /, 'was '))

  return uniq(parts)
}

function passiveVariants(answer) {
  const m = answer.match(/^(was|were|is|are)\s+(\S+)$/i)
  if (!m) return []
  const [, aux, participle] = m
  const base = guessBase(participle)
  const s = thirdPerson(base)
  const ing = ingForm(base)
  const past = pastForm(base)
  const pp = ppForm(base)
  const otherAux = { was: 'were', were: 'was', is: 'are', are: 'is' }[aux.toLowerCase()] ?? 'was'

  return uniq([
    // wrong passive auxiliary
    `${otherAux} ${participle}`,
    `${aux} ${pp}`,
    // Israeli: active instead of passive
    `${s}`,
    `${base}`,
    `${ing}`,
    `${past}`,
    `is ${ing}`,
    `are ${ing}`,
    `was ${ing}`,
    // Israeli: wrong participle form
    `${aux} ${base}`,
    `${aux} ${past}`,
    `${aux} ${base}ed`,
    `${aux} ${pp}ed`,
    // Israeli: present perfect passive confusion
    `has been ${pp}`,
    `have been ${pp}`,
    `had been ${pp}`,
    // Israeli: do passive
    `is ${s}`,
    `was ${s}`,
  ])
}

function pastContinuousVariants(part) {
  const m = part.match(/^(was|were|is|are|am)\s+(\S+)$/i)
  if (!m) return []
  const [, aux, word] = m
  const isIng = word.endsWith('ing')
  const stem = isIng ? guessBase(word) : guessBase(word)
  const ing = ingForm(stem)
  const past = pastForm(stem)
  const s = thirdPerson(stem)
  const otherAux = { was: 'were', were: 'was', is: 'are', are: 'is', am: 'is' }[aux.toLowerCase()] ?? 'was'

  return uniq([
    `${otherAux} ${ing}`,
    `${aux} ${stem}`,
    `${aux} ${past}`,
    `${aux} ${s}`,
    `is ${ing}`,
    `are ${ing}`,
    `was ${ing}`,
    `were ${ing}`,
    `am ${ing}`,
    // Israeli: present simple instead of continuous
    `${aux} ${s}`,
    `do ${stem}`,
    `does ${stem}`,
    // Israeli: will continuous
    `will be ${ing}`,
    `will ${stem}`,
  ])
}

function futureNegativeVariants(answer) {
  const a = answer.trim()
  const m = a.match(/^(am|is|are)\s+not\s+going$/i)
  if (!m) return []

  const subj = m[1].toLowerCase()
  const others = { am: ['is', 'are'], is: ['am', 'are'], are: ['am', 'is'] }[subj] ?? ['is', 'are']

  return uniq([
    ...others.map((s) => `${s} not going`),
    `${subj} going`,
    ...others.map((s) => `${s} going`),
    'will not go',
    "won't go",
    "don't go",
    "doesn't go",
    'not going',
    'was not going',
    'were not going',
    `${subj} not go`,
    `${subj} not goes`,
  ])
}

function futureVariants(answer) {
  const a = answer.trim()
  if (/^(am|is|are)\s+not\s+going$/i.test(a)) return futureNegativeVariants(a)

  if (/^will\s/i.test(a)) {
    const verb = a.replace(/^will\s/i, '')
    const base = guessBase(verb.split(/\s/)[0])
    const particle = verb.includes(' ') ? verb.split(/\s/).slice(1).join(' ') : ''
    const p = particle ? ` ${particle}` : ''
    return uniq([
      `${thirdPerson(base)}${p}`,
      `${base}${p}`,
      `${ingForm(base)}${p}`,
      `is ${ingForm(base)}${p}`,
      `are going to ${base}${p}`,
      `going to ${base}${p}`,
      `would ${base}${p}`,
      `will ${ingForm(base)}${p}`,
      `will to ${base}${p}`,
    ])
  }
  if (/^am\s|^is\s|^are\s/i.test(a) && /going/i.test(a)) {
    const base = guessBase(a.replace(/^(am|is|are)\s+(not\s+)?going(\s+to)?\s*/i, '').split(/\s/)[0])
    return uniq([
      `will ${base}`,
      `${thirdPerson(base)}`,
      `is ${ingForm(base)}`,
      `was ${ingForm(base)}`,
      `go ${base}`,
      `am go`,
      `are go`,
    ])
  }
  if (/^am\s+\w+ing$/i.test(a)) {
    const m = a.match(/^am\s+(\S+)$/i)
    if (m) return pastContinuousVariants(`is ${m[1]}`).map((x) => x.replace(/^is /, 'am '))
  }
  return []
}

function conditionalVariants(answer) {
  const a = answer.trim()
  const parts = []

  if (/^won$/i.test(a)) {
    const v = verbMorphVariants('win')
    parts.push(...v, 'will win', 'would win', 'had won', 'win', 'wins', 'winning')
  } else if (/^will\s/i.test(a)) {
    parts.push(
      a.replace(/^will /, 'would '),
      a.replace(/^will /, ''),
      a.replace(/^will /, 'going to '),
      a.replace(/^will /, 'will to '),
    )
    const verb = a.replace(/^will\s/i, '')
    parts.push(...verbMorphVariants(guessBase(verb.split(/\s/)[0]), verb.includes(' ') ? verb.split(/\s/).slice(1).join(' ') : ''))
  } else if (/^would\s/i.test(a)) {
    parts.push(
      a.replace(/^would /, 'will '),
      a.replace(/^would /, ''),
      a.replace(/^would not /, "won't "),
      a.replace(/^would not /, "don't "),
    )
  } else if (/^don't\s/i.test(a)) {
    parts.push(...presentSimpleNegativeVariants(a))
    parts.push(a.replace(/^don't /, "doesn't "), a.replace(/^don't /, "didn't "), `will not ${a.replace(/^don't\s/i, '')}`)
  } else {
    // if-clause verb: study, hurry, etc.
    const base = guessBase(a.split(/\s/)[0])
    const particle = a.includes(' ') ? a.split(/\s/).slice(1).join(' ') : ''
    parts.push(...verbMorphVariants(base, particle))
    // Israeli: will in if-clause
    parts.push(`will ${base}${particle ? ' ' + particle : ''}`)
    parts.push(`${pastForm(base)}${particle ? ' ' + particle : ''}`)
    parts.push(`${ingForm(base)}${particle ? ' ' + particle : ''}`)
  }

  return uniq(parts)
}

function comparativeVariants(answer) {
  const a = answer.trim()
  const parts = []

  if (/^best$/i.test(a)) {
    parts.push('good', 'better', 'worst', 'the best', 'more good', 'goodest')
  } else if (/^worst$/i.test(a)) {
    parts.push('bad', 'worse', 'best', 'the worst', 'more bad', 'baddest')
  } else if (/^better$/i.test(a)) {
    parts.push('good', 'best', 'more good', 'gooder', 'well')
  } else if (/^worse$/i.test(a)) {
    parts.push('bad', 'worst', 'more bad', 'badder')
  } else if (/^tallest$/i.test(a)) {
    parts.push('tall', 'taller', 'most tall', 'more tall', 'the tallest', 'tallests')
  } else if (/^more expensive$/i.test(a)) {
    parts.push('expensive', 'most expensive', 'expensiver', 'more expensiver', 'expensivest')
  } else if (/^more difficult$/i.test(a)) {
    parts.push('difficult', 'most difficult', 'difficulter', 'more difficulter', 'difficultest')
  } else if (/^more (\w+)$/i.test(a)) {
    const word = a.match(/^more (\w+)$/i)[1]
    parts.push(word, `most ${word}`, `${word}er`, `more ${word}er`)
  } else if (/(\w+)est$/i.test(a)) {
    const stem = a.match(/(\w+)est$/i)[1]
    parts.push(stem, `${stem}er`, `more ${stem}`, `most ${stem}`)
  }

  if (/^more /i.test(a)) parts.push(a.replace(/^more /, ''), a.replace(/^more /, 'most '))
  if (/^the /i.test(a)) parts.push(a.replace(/^the /, ''))

  return uniq(parts.filter((x) => norm(x) !== norm(a)))
}

function justVariants(answer) {
  const a = answer.trim()
  const verb = a.replace(/^just\s+/i, '')
  const base = guessBase(verb)
  return uniq([
    a.replace(/^just /, 'already '),
    a.replace(/^just /, 'yet '),
    `already ${verb}`,
    `have just ${verb}`,
    `has just ${verb}`,
    `just ${base}`,
    `just ${ingForm(base)}`,
    `just ${pastForm(base)}`,
    verb,
    `${pastForm(base)}`,
  ])
}

function articleVariants(answer) {
  const pool = ['a', 'an', 'the', 'some', 'any', '—', 'this', 'that']
  return pool.filter((p) => norm(p) !== norm(answer))
}

function gerundInfinitiveVariants(answer) {
  const a = answer.trim()
  if (/^to\s/i.test(a)) {
    const rest = a.replace(/^to\s/i, '')
    const base = guessBase(rest.split(/\s/)[0])
    const particle = rest.includes(' ') ? rest.split(/\s/).slice(1).join(' ') : ''
    const p = particle ? ` ${particle}` : ''
    return uniq([
      rest,
      `${base}${p}`,
      `${ingForm(base)}${p}`,
      `for ${base}${p}`,
      `for to ${base}${p}`,
      `${thirdPerson(base)}${p}`,
      `will ${base}${p}`,
      // Israeli: -ing after to
      `to ${ingForm(base)}${p}`,
      // Israeli: bare infinitive confusion
      `${pastForm(base)}${p}`,
    ])
  }

  const base = baseFromGerund(a)
  return uniq([
    base,
    `to ${base}`,
    ingForm(base),
    pastForm(base),
    thirdPerson(base),
    `will ${base}`,
    // Israeli: infinitive where gerund needed
    `to ${ingForm(base)}`,
  ])
}

function dualAnswerVariants(answer) {
  const parts = answer.split(/\s*\/\s*/).map((p) => p.trim())
  if (parts.length !== 2) return []

  const pool1 = partDistractors(parts[0])
  const pool2 = partDistractors(parts[1])
  const out = []

  for (const b of pool2) {
    if (norm(b) !== norm(parts[1])) out.push(`${parts[0]} / ${b}`)
  }
  for (const a of pool1) {
    if (norm(a) !== norm(parts[0])) out.push(`${a} / ${parts[1]}`)
  }
  for (const a of pool1.slice(0, 4)) {
    for (const b of pool2.slice(0, 4)) {
      if (norm(a) === norm(parts[0]) && norm(b) === norm(parts[1])) continue
      out.push(`${a} / ${b}`)
    }
  }
  return uniq(out)
}

function partDistractors(part) {
  const p = part.trim()
  if (PREPOSITIONS.includes(norm(p))) return PREPOSITIONS
  if (AUX_DO.includes(norm(p))) return AUX_DO
  if (/^(do|does|did|is|are|was|were|have|has)$/i.test(p)) {
    return ['do', 'does', 'did', 'is', 'are', 'was', 'were', 'have', 'has']
  }
  if (/^(was|were|is|are|am)\s+\S+/i.test(p)) return pastContinuousVariants(p)
  if (/^(have|has)\s/i.test(p)) return presentPerfectVariants(p)
  if (/^(don't|doesn't|didn't)\s/i.test(p)) return presentSimpleNegativeVariants(p)
  if (/\s/.test(p)) return phrasalVariants(p)
  return verbMorphVariants(guessBase(p))
}

function adverbVariants(answer) {
  const a = answer.trim()
  const pool = [
    'good', 'well', 'bad', 'badly', 'quick', 'quickly',
    'careful', 'carefully', 'loud', 'loudly', 'angry', 'angrily', 'happy', 'happily',
  ]
  const lyFromAdj = { good: 'well', bad: 'badly', quick: 'quickly', careful: 'carefully', loud: 'loudly', angry: 'angrily', happy: 'happily' }

  if (a.endsWith('ly')) {
    const base = a.replace(/ly$/, '')
    if (base.length >= 2) pool.push(base) // Israeli: adjective instead of adverb
  } else if (lyFromAdj[a]) {
    // already covered in pool
  } else if (a.length >= 3 && a !== 'well') {
    pool.push(`${a}ly`)
  }

  return uniq(pool.filter((p) => norm(p) !== norm(a)))
}

function detectType(answer) {
  const a = answer.trim()
  const n = norm(a)

  if (/\s*\/\s*/.test(a)) return 'dual'
  if (/^(am|is|are)\s+not\s+going$/i.test(a)) return 'future_negative'
  if (/^(there is|there are|is there|are there|was there|were there)/i.test(a)) return 'there'
  if (/^(don't|doesn't|didn't)\s/.test(a)) return 'present_simple_negative'
  if (/^just\s/i.test(a)) return 'just_adverb'
  if (/^(was|were|is|are|am)\s+\S+ing$/i.test(a)) return 'past_continuous'
  if (/^(was|were|is|are|am)\s+\S+/i.test(a) && /going|writing|visiting/i.test(a)) return 'future'
  if (/^(have|has|had)\s/i.test(a)) return 'present_perfect'
  if (/^(was|were|is|are)\s+\S+$/i.test(a) && /made|built|sent|served|spoken/i.test(a)) return 'passive'
  if (/^will\s|^would\s|^won$|^am going|^is going|^are going|^am writing/i.test(a)) return 'conditional'
  if (/^would not|^don't hurry/i.test(a)) return 'conditional'
  if (/^(more |most |better|best|worst|worse)/i.test(a) || /tallest|expensive|difficult/i.test(a)) return 'comparative'
  if (/^to\s/i.test(a)) return 'infinitive'
  if (/ing$/i.test(a) && !/^(is|are|was|were|am)\s/.test(a)) return 'gerund'
  if (/^(myself|yourself|himself|herself|itself|ourselves|themselves)$/i.test(a)) return 'reflexive'
  if (PREPOSITIONS.includes(n)) return 'preposition'
  if (ARTICLES.includes(n)) return 'article'
  if (MODALS.includes(n)) return 'modal'
  if (RELATIVES.includes(n)) return 'relative'
  if (/^(many|much|few|little|some|any)$/i.test(a)) return 'quantifier'
  if (/ly$/i.test(a)) return 'adverb'
  if (/^(well|good|bad|loud|quick|careful)$/i.test(a)) return 'adj_adv'
  if (/^(too|enough|so|very)$/i.test(a)) return 'too_enough'
  if (/^(so that|because|in order to)$/i.test(a)) return 'purpose'
  if (/^(to|for)$/i.test(a)) return 'purpose'
  if (/^(is|are|was|were|am|be)$/i.test(a)) return 'be'
  return 'verb'
}

export function generateDistractors(answer, _category, count = 8) {
  const correct = answer.trim()
  const type = detectType(correct)
  let pool = []

  switch (type) {
    case 'dual':
      pool = dualAnswerVariants(correct)
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
    case 'future':
      pool = futureVariants(correct)
      break
    case 'future_negative':
      pool = futureNegativeVariants(correct)
      break
    case 'conditional':
      pool = conditionalVariants(correct)
      break
    case 'comparative':
      pool = comparativeVariants(correct)
      break
    case 'just_adverb':
      pool = justVariants(correct)
      break
    case 'gerund':
    case 'infinitive':
      pool = gerundInfinitiveVariants(correct)
      break
    case 'present_simple_negative':
      pool = presentSimpleNegativeVariants(correct)
      break
    case 'preposition':
      pool = PREPOSITIONS.filter((p) => norm(p) !== norm(correct))
      break
    case 'article':
      pool = articleVariants(correct)
      break
    case 'modal':
      pool = MODALS.filter((p) => norm(p) !== norm(correct))
      break
    case 'relative':
      pool = RELATIVES.filter((p) => norm(p) !== norm(correct))
      break
    case 'reflexive':
      pool = ['myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves'].filter(
        (p) => norm(p) !== norm(correct),
      )
      break
    case 'quantifier':
      pool = ['many', 'much', 'few', 'little', 'some', 'any', 'a lot of'].filter((p) => norm(p) !== norm(correct))
      break
    case 'adverb':
    case 'adj_adv':
      pool = adverbVariants(correct)
      break
    case 'too_enough':
      pool = ['too', 'enough', 'so', 'very', 'also', 'much', 'many']
      break
    case 'purpose':
      pool = ['to', 'for', 'so that', 'because', 'in order to', 'and']
      break
    case 'be':
      pool = ['is', 'are', 'am', 'was', 'were', 'be', 'been', 'being']
      break
    default:
      pool = /\s/.test(correct) ? phrasalVariants(correct) : verbMorphVariants(guessBase(correct))
  }

  pool = uniq(pool.filter((x) => norm(x) !== norm(correct) && x.length > 0))

  const noVerbFallback = new Set([
    'article', 'preposition', 'modal', 'relative', 'quantifier', 'reflexive',
    'purpose', 'too_enough', 'there', 'be', 'comparative', 'just_adverb', 'future_negative',
    'adverb', 'adj_adv',
  ])

  if (pool.length < count && !noVerbFallback.has(type)) {
    const extra = /\s/.test(correct)
      ? phrasalVariants(correct)
      : verbMorphVariants(guessBase(correct))
    pool = uniq([...pool, ...extra.filter((x) => norm(x) !== norm(correct))])
  }

  if (pool.length < count && !noVerbFallback.has(type) && /\s/.test(correct)) {
    const swaps = [
      correct.replace(/^have /i, 'has '),
      correct.replace(/^has /i, 'have '),
      correct.replace(/^is /i, 'are '),
      correct.replace(/^are /i, 'is '),
      correct.replace(/^was /i, 'is '),
      correct.replace(/^will /i, 'would '),
      correct.replace(/^am /i, 'is '),
      correct.replace(/ing$/i, 'ed'),
      correct.replace(/ed$/i, 'ing'),
    ]
    pool = uniq([...pool, ...swaps.filter((x) => norm(x) !== norm(correct))])
  }

  return pool
}

export function buildOptions(correct, category) {
  const distractors = uniq(generateDistractors(correct, category, 12).filter((x) => norm(x) !== norm(correct))).slice(
    0,
    5,
  )

  let options = uniq([correct, ...distractors])

  if (options.length < 6) {
    const extra = generateDistractors(correct, category, 20).filter((x) => norm(x) !== norm(correct))
    for (const e of extra) {
      if (options.length >= 6) break
      if (!options.some((o) => norm(o) === norm(e))) options.push(e)
    }
  }

  if (options.length < 6) {
    console.warn(`Only ${options.length} options for "${correct}" (${category})`)
    const type = detectType(correct)
    const noVerbFallback = new Set([
      'article', 'preposition', 'modal', 'relative', 'quantifier', 'reflexive',
      'purpose', 'too_enough', 'there', 'be', 'comparative', 'just_adverb', 'future_negative',
      'adverb', 'adj_adv',
    ])
    if (!noVerbFallback.has(type)) {
      const morph = /\s/.test(correct) ? phrasalVariants(correct) : verbMorphVariants(guessBase(correct))
      for (const m of morph) {
        if (options.length >= 6) break
        if (norm(m) !== norm(correct) && !options.some((o) => norm(o) === norm(m))) options.push(m)
      }
    }
    if (!noVerbFallback.has(type)) {
      const extra = generateDistractors(correct, category, 20).filter((x) => norm(x) !== norm(correct))
      for (const e of extra) {
        if (options.length >= 6) break
        if (!options.some((o) => norm(o) === norm(e))) options.push(e)
      }
    }
  }

  options = options.slice(0, 6)
  const shuffled = shuffleOptions(options)
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
