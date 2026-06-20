export type WrongChoiceLine = { prompt: string; chosen: string }

export type SessionReportPayload = {
  wrongLines: WrongChoiceLine[]
  correctCount: number
}

const RECIPIENT = 'moshe.hoffman@gmail.com'
const PLAYER_NAME = 'יהונתן'

function formatMessage(payload: SessionReportPayload): string {
  const header = `מספר תשובות נכונות שנענו: ${payload.correctCount}\n\n`
  if (payload.wrongLines.length === 0) {
    return `${header}לא נרשמו בחירות שגויות.`
  }
  const body = payload.wrongLines.map((l) => `${l.prompt}\nנבחר: ${l.chosen}`).join('\n\n')
  return `${header}${body}`
}

export function sendSessionReportEmail(
  payload: SessionReportPayload,
  opts?: { keepalive?: boolean },
): void {
  if (payload.wrongLines.length === 0 && payload.correctCount === 0) return
  const url = `https://formsubmit.co/ajax/${encodeURIComponent(RECIPIENT)}`
  const message = formatMessage(payload)
  const subject = `סיכום תרגול אנגלית — ${PLAYER_NAME}`
  const body = JSON.stringify({
    _subject: subject,
    name: `תרגול דקדוק (${PLAYER_NAME})`,
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
