'use client'

import { useState } from 'react'
import type { GuestbookEntry } from '@/lib/guestbook'
import { generateShareImage } from '@/lib/guestbook'
import { useBackdropDismiss } from '@/lib/useBackdropDismiss'
import { useIsMobile } from '@/lib/useIsMobile'

interface Props {
  entry: GuestbookEntry
  onClose: () => void
}

export default function ShareModal({ entry, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const dismiss = useBackdropDismiss(onClose)
  const compact = useIsMobile()

  const saveImage = () => {
    const dataUrl = generateShareImage(entry)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `sweden-laundry-guestbook-${entry.id}.png`
    a.click()
  }

  const shareNative = async () => {
    const dataUrl = generateShareImage(entry)
    // Convert data URL to Blob
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    const file = new File([blob], 'sweden-laundry-guestbook.png', { type: 'image/png' })
    try {
      await navigator.share({
        title: '스웨덴세탁소 방명록',
        text: entry.text,
        files: [file],
      })
    } catch {
      // Fallback to save
      saveImage()
    }
  }

  const shareTwitter = () => {
    const tweet = encodeURIComponent(
      `"${entry.text}"\n\n— 스웨덴세탁소 방명록\n#스웨덴세탁소 #방명록`
    )
    window.open(`https://twitter.com/intent/tweet?text=${tweet}`, '_blank')
  }

  const shareInstagram = () => {
    // Instagram doesn't support direct share via URL; download then instruct user
    saveImage()
    alert('이미지를 저장했습니다. 인스타그램 앱에서 공유해 주세요!')
  }

  const copyText = async () => {
    await navigator.clipboard.writeText(entry.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const date = new Date(entry.timestamp).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(20,12,6,0.75)', backdropFilter: 'blur(4px)' }}
      {...dismiss}
    >
      <div
        className="relative flex flex-col w-[min(440px,90vw)] max-h-[90vh] overflow-y-auto"
        style={{
          background: '#FAF4EC',
          border: '2px solid #C8A870',
          padding: '32px 28px 24px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          fontFamily: "'Mona12', sans-serif",
          transform: compact ? 'scale(0.82)' : undefined,
          transformOrigin: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Entry preview */}
        <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: '#9A7A50' }}>
          방명록 · {date}
        </p>
        <div
          className="mb-6 px-4 py-3"
          style={{ background: '#FBF5EE', border: '1px solid #E0D0B0' }}
        >
          <p
            style={{
              fontFamily: "'Mona12', sans-serif",
              fontSize: 15, color: '#3A2810', lineHeight: 1.7,
            }}
          >
            "{entry.text}"
          </p>
        </div>

        {/* Share options */}
        <p className="text-[10px] tracking-[0.20em] uppercase mb-3" style={{ color: '#8A6840' }}>
          공유하기
        </p>

        <div className="flex flex-col gap-2">
          {/* Save image */}
          <button
            onClick={saveImage}
            className="flex items-center gap-3 px-4 py-3 text-[12px] tracking-wider text-left"
            style={{
              background: '#3A2810', color: '#FAF0E6',
              border: 'none',
            }}
          >
            <span style={{ fontSize: 16 }}>🖼️</span>
            이미지로 저장 (PNG)
          </button>

          {/* Native share (mobile) */}
          {'share' in navigator && (
            <button
              onClick={shareNative}
              className="flex items-center gap-3 px-4 py-3 text-[12px] tracking-wider text-left"
              style={{ background: '#FAF0E6', color: '#3A2810', border: '1px solid #C8A870' }}
            >
              <span style={{ fontSize: 16 }}>📤</span>
              공유하기 (기본 앱)
            </button>
          )}

          {/* Twitter / X */}
          <button
            onClick={shareTwitter}
            className="flex items-center gap-3 px-4 py-3 text-[12px] tracking-wider text-left"
            style={{ background: '#FAF0E6', color: '#3A2810', border: '1px solid #C8A870' }}
          >
            <span style={{ fontSize: 16 }}>𝕏</span>
            Twitter / X 에 공유
          </button>

          {/* Instagram */}
          <button
            onClick={shareInstagram}
            className="flex items-center gap-3 px-4 py-3 text-[12px] tracking-wider text-left"
            style={{ background: '#FAF0E6', color: '#3A2810', border: '1px solid #C8A870' }}
          >
            <span style={{ fontSize: 16 }}>📸</span>
            Instagram 용 이미지 저장
          </button>

          {/* Copy text */}
          <button
            onClick={copyText}
            className="flex items-center gap-3 px-4 py-3 text-[12px] tracking-wider text-left"
            style={{ background: '#FAF0E6', color: copied ? '#70A040' : '#3A2810', border: '1px solid #C8A870' }}
          >
            <span style={{ fontSize: 16 }}>{copied ? '✓' : '📋'}</span>
            {copied ? '복사됨!' : '텍스트 복사'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[18px]"
          style={{ color: '#A08050' }}
          aria-label="닫기"
        >×</button>
      </div>
    </div>
  )
}
