export interface GuestbookEntry {
  id: string
  text: string
  timestamp: number   // Date.now()
}

// Generate a share-ready PNG — 9:16 portrait (1080 × 1920)
export function generateShareImage(entry: GuestbookEntry): string {
  const W = 1080, H = 1920
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // ── Background ───────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#FAF0E6')
  bg.addColorStop(0.5, '#F5E8D8')
  bg.addColorStop(1, '#EDE0CC')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Subtle texture dots
  ctx.fillStyle = 'rgba(160,120,60,0.04)'
  for (let i = 0; i < 300; i++) {
    ctx.beginPath()
    ctx.arc((i * 137) % W, (i * 97 + 31) % H, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── Double border ─────────────────────────────────────────────────
  ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 4
  ctx.strokeRect(32, 32, W - 64, H - 64)
  ctx.strokeStyle = '#D8B880'; ctx.lineWidth = 2
  ctx.strokeRect(48, 48, W - 96, H - 96)

  // Corner ornaments
  ;[[64,64],[W-64,64],[64,H-64],[W-64,H-64]].forEach(([x,y]) => {
    ctx.fillStyle = '#C8A870'
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#D8B880'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.stroke()
  })

  // ── Header ────────────────────────────────────────────────────────
  // Laundry icon area
  ctx.fillStyle = '#C8A870'; ctx.globalAlpha = 0.18
  ctx.beginPath(); ctx.arc(W / 2, 220, 80, 0, Math.PI * 2); ctx.fill()
  ctx.globalAlpha = 1

  ctx.fillStyle = '#C8A870'; ctx.textAlign = 'center'
  ctx.font = '88px serif'; ctx.fillText('🧺', W / 2, 260)

  ctx.fillStyle = '#2A1808'
  ctx.font = `bold 72px serif`
  ctx.fillText('스웨덴세탁소', W / 2, 370)

  ctx.font = '32px monospace'; ctx.fillStyle = '#9A7040'
  ctx.fillText('방명록 · Guestbook', W / 2, 430)

  // Top divider
  ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(120, 480); ctx.lineTo(W - 120, 480); ctx.stroke()
  // Double line
  ctx.strokeStyle = '#D8B880'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(120, 490); ctx.lineTo(W - 120, 490); ctx.stroke()

  // ── Quote marks ───────────────────────────────────────────────────
  ctx.font = '200px serif'; ctx.fillStyle = 'rgba(180,140,80,0.10)'
  ctx.textAlign = 'left'; ctx.fillText('“', 80, 760)
  ctx.textAlign = 'right'; ctx.fillText('”', W - 80, H - 480)

  // ── Message text ──────────────────────────────────────────────────
  ctx.fillStyle = '#3A2810'
  ctx.textAlign = 'center'

  const fontSize = entry.text.length > 80 ? 44
    : entry.text.length > 40 ? 52
    : 62
  ctx.font = `${fontSize}px serif`

  // Word wrap (Korean characters don't split on spaces, handle char by char if needed)
  const maxLineW = W - 240
  const segments = entry.text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const seg of segments) {
    const test = cur ? `${cur} ${seg}` : seg
    if (ctx.measureText(test).width > maxLineW && cur) {
      lines.push(cur); cur = seg
    } else { cur = test }
  }
  if (cur) lines.push(cur)

  const lineH = fontSize * 1.6
  const blockH = lines.length * lineH
  const textCenterY = H / 2 + 60
  const startY = textCenterY - blockH / 2

  lines.forEach((ln, i) => {
    ctx.fillText(ln, W / 2, startY + i * lineH)
  })

  // ── Bottom divider ────────────────────────────────────────────────
  ctx.strokeStyle = '#D8B880'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(120, H - 500); ctx.lineTo(W - 120, H - 500); ctx.stroke()
  ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(120, H - 488); ctx.lineTo(W - 120, H - 488); ctx.stroke()

  // ── Footer ────────────────────────────────────────────────────────
  const date = new Date(entry.timestamp).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  ctx.font = '34px serif'; ctx.fillStyle = '#6A4A20'; ctx.textAlign = 'center'
  ctx.fillText(`"${date}"`, W / 2, H - 400)

  ctx.font = '28px monospace'; ctx.fillStyle = '#A08050'
  ctx.fillText('swedenlaundry.com', W / 2, H - 340)

  // EST badge
  ctx.font = '24px monospace'; ctx.fillStyle = '#C8A870'
  ctx.fillText('─── EST. 2012 ───', W / 2, H - 280)

  // Wes Anderson-style stripe at very bottom
  const stripes = ['#C8A870', '#FAF0E6', '#D8B880', '#FAF0E6', '#C8A870']
  const stripeH = 24
  stripes.forEach((col, i) => {
    ctx.fillStyle = col
    ctx.fillRect(48, H - 160 + i * stripeH, W - 96, stripeH)
  })

  return c.toDataURL('image/png')
}
