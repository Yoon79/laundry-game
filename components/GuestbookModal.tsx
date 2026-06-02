'use client'

import { useState } from 'react'
import { useBackdropDismiss } from '@/lib/useBackdropDismiss'

interface Props {
  onSubmit: (text: string) => void
  onClose:  () => void
}

export default function GuestbookModal({ onSubmit, onClose }: Props) {
  const [text, setText] = useState('')
  const MAX = 120
  const dismiss = useBackdropDismiss(onClose)

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(20,12,6,0.72)', backdropFilter: 'blur(3px)' }}
      {...dismiss}
    >
      <div
        className="relative flex flex-col w-[min(480px,90vw)]"
        style={{
          background: '#FAF4EC',
          border: '2px solid #C8A870',
          padding: '36px 32px 28px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.50)',
          fontFamily: "'Mona12', sans-serif",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Bench icon + title */}
        <div className="flex items-center gap-3 mb-1">
          <span style={{ fontSize: 22 }}>🪑</span>
          <p className="text-[10px] tracking-[0.20em] uppercase" style={{ color: '#9A7A50' }}>
            스웨덴세탁소 · 방명록
          </p>
        </div>
        <h2
          style={{
            fontFamily: "'Mona12', sans-serif",
            fontSize: 22, color: '#2A1A08', marginBottom: 18,
          }}
        >
          이 곳에 한 마디 남겨요
        </h2>

        {/* Text area */}
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX))}
          placeholder="세탁소에서 느낀 것들, 오늘의 감정, 무엇이든 괜찮아요."
          rows={4}
          style={{
            resize: 'none',
            background: '#FBF5EE',
            border: '1px solid #D8C8A8',
            padding: '12px 14px',
            fontSize: 13,
            color: '#3A2810',
            fontFamily: "'Mona12', sans-serif",
            lineHeight: 1.65,
            outline: 'none',
            marginBottom: 8,
          }}
        />
        <p className="text-right text-[10px]" style={{ color: '#B09060', marginBottom: 18 }}>
          {text.length} / {MAX}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="text-[11px] tracking-widest uppercase px-5 py-2"
            style={{ color: '#A08050', border: '1px solid #D8C8A8' }}
          >
            닫기
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="text-[11px] tracking-widest uppercase px-5 py-2"
            style={{
              background: text.trim() ? '#3A2810' : '#C8B898',
              color: '#FAF0E6',
              cursor: text.trim() ? 'pointer' : 'default',
            }}
          >
            벽에 남기기 →
          </button>
        </div>

        {/* Decorative rule */}
        <p
          className="text-center text-[9px] tracking-[0.22em] uppercase mt-5"
          style={{ color: '#C0A070' }}
        >
          스웨덴세탁소 · EST. 2012
        </p>

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
