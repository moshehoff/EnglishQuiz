/** Derive answers from parenthetical hints in more2 worksheets */

const PP_IRREGULAR = {
  be: 'been',
  eat: 'eaten',
  see: 'seen',
  break: 'broken',
  give: 'given',
  write: 'written',
  go: 'gone',
  do: 'done',
  know: 'known',
  take: 'taken',
  speak: 'spoken',
  get: 'got',
  forget: 'forgotten',
  lose: 'lost',
  buy: 'bought',
  read: 'read',
  learn: 'learned',
  leave: 'left',
  make: 'made',
  send: 'sent',
  build: 'built',
  hear: 'heard',
  tell: 'told',
  win: 'won',
  run: 'run',
  swim: 'swum',
  drive: 'driven',
  fly: 'flown',
  wake: 'woken',
  choose: 'chosen',
  arise: 'arisen',
}

function pp(verb) {
  const v = verb.trim().toLowerCase()
  if (PP_IRREGULAR[v]) return PP_IRREGULAR[v]
  if (v.endsWith('e')) return v + 'd'
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ied'
  return v + 'ed'
}

function subjectAux(textBeforeBlank) {
  const t = textBeforeBlank.trim()
  if (/^have\s/i.test(t) || /^Have\s/.test(t)) return 'have'
  if (/^has\s/i.test(t) || /^Has\s/.test(t)) return 'has'
  if (/^(I|We|You|They)\b/.test(t)) return 'have'
  return 'has'
}

export function presentPerfectVerbAnswer(body) {
  const hint = body.match(/\(([^)]+)\)/)?.[1]?.trim()
  if (!hint) return null
  const before = body.split(/`_{3,}`|_{3,}/)[0].trim()
  const aux = subjectAux(before)
  const words = hint.split(/\s+/)

  if (words[0] === 'not') return `${aux} not ${pp(words.slice(1).join(' '))}`
  if (words[0] === 'never') return `${aux} never ${pp(words.slice(1).join(' '))}`
  if (words[0] === 'already') return `${aux} already ${pp(words.slice(1).join(' '))}`
  if (words[0] === 'just') return `${aux} just ${pp(words.slice(1).join(' '))}`
  return `${aux} ${pp(hint)}`
}

export function forSinceAnswer(body) {
  const after = (body.split(/`_{3,}`|_{3,}/)[1] || '').trim().toLowerCase()
  if (
    /^\d{4}|january|february|march|april|may|june|july|august|september|october|november|december|monday|childhood|he was|she was|i was|morning/.test(
      after,
    )
  ) {
    return 'since'
  }
  return 'for'
}

export function wordChoiceAnswer(body) {
  const m = body.match(/\(([^/)]+)\s*\/\s*([^)]+)\)/)
  if (!m) return null
  const lower = body.toLowerCase()
  const a = m[1].trim()
  const b = m[2].trim()

  if (/\?/.test(body) && (a === 'yet' || b === 'yet')) return 'yet'
  if (lower.includes('eaten lunch') && (a === 'just' || b === 'just')) return 'just'
  if (lower.includes('visited paris') && (a === 'already' || b === 'already')) return 'already'
  if (lower.includes('been to greece') && (a === 'ever' || b === 'ever')) return 'ever'
  if (lower.includes("haven't arrived") || lower.includes('not arrived')) {
    if (a === 'yet' || b === 'yet') return 'yet'
  }
  if (lower.includes('finished the game') && (a === 'already' || b === 'already')) return 'already'
  if (lower.includes('kangaroo') && (a === 'never' || b === 'never')) return 'never'
  if (lower.includes('left the station') && (a === 'just' || b === 'just')) return 'just'
  if (lower.includes('tried skiing') && (a === 'ever' || b === 'ever')) return 'ever'
  if (lower.includes('called me') && (a === 'just' || b === 'just')) return 'just'
  return a
}

export function conditionalAnswer(line) {
  const l = line.toLowerCase()
  const hints = [...line.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim())
  if (hints.length < 2) return null

  const rules = [
    [/rain.*tomorrow/, 'rains / will stay'],
    [/taller/, 'were / would play'],
    [/harder last year/, 'had studied / would have passed'],
    [/not hurry/, "don't hurry / will miss"],
    [/million dollars/, 'had / would travel'],
    [/earlier yesterday/, 'had left / would have arrived'],
    [/homework tonight/, 'finishes / will watch'],
    [/answer yesterday/, 'had known / would have told'],
    [/near the beach/, 'lived / would go'],
    [/call.*later/, 'calls / will help'],
    [/listen.*lesson/, 'listens / will understand'],
    [/100°c/, 'heat / boils'],
    [/dog yesterday/, 'had seen / would have been'],
    [/allow.*concert/, 'allow / will go'],
    [/more confident/, 'were / would speak'],
    [/map with us/, 'had taken / would not have got'],
    [/weather.*nice tomorrow/, 'is / will have'],
    [/practice.*last month/, 'had practiced / would have won'],
    [/more free time/, 'had / would learn'],
    [/not forget.*tickets/, 'had not forgotten / would have entered'],
  ]

  for (const [re, ans] of rules) {
    if (re.test(l)) return ans
  }
  return null
}

export function conditionalCategory(answer, line) {
  const l = line.toLowerCase()
  if (/had .+ \/ would have|had not .+ \/ would have|would not have/.test(answer)) return 'third_conditional'
  if (/would /.test(answer.split('/')[1] || '') && !/will /.test(answer)) return 'second_conditional'
  if (/yesterday|last year|last month|last weekend|earlier yesterday/.test(l) && /would have/.test(answer)) {
    return 'third_conditional'
  }
  if (/would /.test(answer)) return 'second_conditional'
  return 'first_conditional'
}
