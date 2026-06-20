import fs from 'fs'

function norm(s) { return s.replace(/\u2019/g, "'").trim().toLowerCase() }

const questions = JSON.parse(fs.readFileSync('public/questions.json', 'utf8'))

const BAD_PATTERNS = [
  { re: /\$\{/, type: 'template' },
  { re: /^\s|\s$/, type: 'space' },
  { re: /^(aned|aning|ans|thed|thes|thing)$/i, type: 'morph-article' },
  { re: /danc[^e]|smok[^ie]/i, type: 'bad-stem' },
  { re: /^most b$|^more b$|^b$/i, type: 'bad-superlative' },
  { re: /^(was ing|is ing|will )$/i, type: 'garbage' },
  { re: /^justing |justs |justed /i, type: 'bad-just' },
  { re: /wellly/i, type: 'bad-adverb' },
]

const issues = []

for (let i = 0; i < questions.length; i++) {
  const q = questions[i]
  const correct = q.options[q.correctIndex]
  const wrong = q.options.filter((_, j) => j !== q.correctIndex)

  if (q.options.length !== 6) issues.push({ i: i + 1, type: 'count', q, msg: `${q.options.length} options` })
  if (!correct) issues.push({ i: i + 1, type: 'index', q, msg: 'bad correctIndex' })

  for (const w of wrong) {
    for (const { re, type } of BAD_PATTERNS) {
      if (re.test(w)) issues.push({ i: i + 1, type, q, correct, wrong: w })
    }
  }
}

console.log(`Total questions: ${questions.length}`)
console.log(`Real issues: ${issues.length}\n`)

if (issues.length) {
  for (const iss of issues) {
    console.log(`#${iss.i} [${iss.type}] ${iss.q.prompt}`)
    console.log(`  correct: ${iss.correct ?? iss.q.options[iss.q.correctIndex]}`)
    if (iss.wrong) console.log(`  bad: ${iss.wrong}`)
    console.log(`  options: ${iss.q.options.join(' | ')}`)
  }
} else {
  console.log('All 100 questions passed quality checks.')
}

// Spot-check previously broken questions
const checks = [
  ['forgets', /forget|forgot|forgetting/i],
  ['best', /good|better|worst|the best/i],
  ['dancing', (w) => !/danc[^e]/i.test(w)],
  ['smoking', (w) => !/smok[^ie]/i.test(w)],
  ['am not going', /not going|going|won't|don't go/i],
  ['an', /^(a|an|the|some|any|—|this|that)$/],
  ['the', /^(a|an|the|some|any|—|this|that)$/],
  ['just arrived', /just|arriv/i],
]
console.log('\nSpot checks:')
for (const [answer, pattern] of checks) {
  const q = questions.find((x) => norm(x.options[x.correctIndex]) === norm(answer))
  if (!q) { console.log(`  MISSING: ${answer}`); continue }
  const wrong = q.options.filter((_, j) => j !== q.correctIndex)
  const ok = typeof pattern === 'function'
    ? wrong.every(pattern)
    : wrong.every((w) => pattern.test(w))
  console.log(`  ${ok ? 'OK' : 'CHECK'} "${q.prompt.slice(0, 50)}..." → ${wrong.join(', ')}`)
}
