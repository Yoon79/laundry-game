export interface GuestbookEntry {
  id: string
  text: string
  timestamp: number   // Date.now()
}

// Generate a share-ready PNG data URL for a guestbook entry
export function generateShareImage(entry: GuestbookEntry): string {
  const W = 800, H = 560
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // Warm cream background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#FAF0E6'); bg.addColorStop(1, '#F0E4D4')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  // Outer border
  ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 3
  ctx.strokeRect(16, 16, W - 32, H - 32)
  // Inner border
  ctx.strokeStyle = '#D8B880'; ctx.lineWidth = 1.5
  ctx.strokeRect(26, 26, W - 52, H - 52)

  // Corner ornaments
  ;[[34,34],[W-34,34],[34,H-34],[W-34,H-34]].forEach(([x,y]) => {
    ctx.fillStyle = '#C8A870'
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fill()
  })

  // Header
  ctx.fillStyle = '#3A1808'
  ctx.font = 'bold 32px serif'
  ctx.textAlign = 'center'
  ctx.fillText('SWEDEN LAUNDRY', W / 2, 90)

  ctx.font = '16px monospace'
  ctx.fillStyle = '#8A6040'
  ctx.fillText('방명록 · Guestbook', W / 2, 118)

  // Divider
  ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(80, 138); ctx.lineTo(W - 80, 138); ctx.stroke()

  // Message text — auto word-wrap
  ctx.fillStyle = '#3A2810'
  ctx.textAlign = 'center'
  const fontSize = entry.text.length > 60 ? 22 : 26
  ctx.font = `${fontSize}px serif`
  const maxW = W - 160
  const words = entry.text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur); cur = w
    } else cur = test
  }
  if (cur) lines.push(cur)
  const lineH = fontSize * 1.5
  const blockH = lines.length * lineH
  const startY = (H - 80) / 2 - blockH / 2 + 60
  lines.forEach((ln, i) => ctx.fillText(ln, W / 2, startY + i * lineH))

  // Decorative quotation marks
  ctx.font = '72px serif'; ctx.fillStyle = 'rgba(180,140,80,0.15)'
  ctx.textAlign = 'left'; ctx.fillText('“', 50, 220)
  ctx.textAlign = 'right'; ctx.fillText('”', W - 50, H - 100)

  // Footer divider
  ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(80, H - 90); ctx.lineTo(W - 80, H - 90); ctx.stroke()

  // Footer text
  ctx.fillStyle = '#A08050'; ctx.font = '13px monospace'; ctx.textAlign = 'center'
  const date = new Date(entry.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  ctx.fillText(`swedenlaundry.com  ·  ${date}`, W / 2, H - 56)

  return c.toDataURL('image/png')
}
