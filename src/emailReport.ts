import type { Player } from './players.ts'

export type WrongChoiceLine = {
  prompt: string
  chosen: string
  correct: string
  category: string
  categoryTitle: string
}

export type SessionReportPayload = {
  wrongLines: WrongChoiceLine[]
  correctCount: number
  player: Player
}

function formatMessage(payload: SessionReportPayload): string {
  const lines: string[] = [
    `מספר תשובות נכונות: ${payload.correctCount}`,
    `מספר טעויות: ${payload.wrongLines.length}`,
  ]

  if (payload.wrongLines.length === 0) return lines.join('\n')

  lines.push('')

  const byCategory = new Map<string, { title: string; items: WrongChoiceLine[] }>()
  for (const w of payload.wrongLines) {
    const group = byCategory.get(w.category) ?? { title: w.categoryTitle, items: [] }
    group.items.push(w)
    byCategory.set(w.category, group)
  }

  const groups = [...byCategory.values()].sort((a, b) => {
    const byCount = b.items.length - a.items.length
    return byCount !== 0 ? byCount : a.title.localeCompare(b.title, 'he')
  })

  for (const group of groups) {
    const label = group.items.length === 1 ? 'טעות' : 'טעויות'
    lines.push(`${group.title}: ${group.items.length} ${label}`)
    for (const w of group.items) {
      lines.push(w.prompt)
      lines.push(`נבחר: ${w.chosen}`)
      lines.push(`במקום: ${w.correct}`)
      lines.push('')
    }
  }

  return lines.join('\n').trimEnd()
}

export function sendSessionReportEmail(
  payload: SessionReportPayload,
  opts?: { keepalive?: boolean },
): void {
  if (payload.wrongLines.length === 0 && payload.correctCount === 0) return
  const url = `https://formsubmit.co/ajax/${encodeURIComponent(payload.player.email)}`
  const message = formatMessage(payload)
  const subject = `סיכום תרגול אנגלית — ${payload.player.name}`
  const body = JSON.stringify({
    _subject: subject,
    name: `תרגול דקדוק (${payload.player.name})`,
    message,
    _captcha: 'false',
  })
  void fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
    keepalive: opts?.keepalive ?? false,
  }).catch(() => {
    /* דוח לא קריטי */
  })
}
