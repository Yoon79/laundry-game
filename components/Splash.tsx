interface Props {
  onEnter: () => void
}

export default function Splash({ onEnter }: Props) {
  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-[#FAF0E6]">
      {/* Title card */}
      <div
        className="relative border-[3px] border-[#C8A08A] px-20 py-12 bg-[#FBF3EC]"
        style={{ minWidth: 360 }}
      >
        {/* Corner marks */}
        <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#C8A08A]" />
        <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#C8A08A]" />
        <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#C8A08A]" />
        <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#C8A08A]" />

        <p
          className="text-center text-[10px] tracking-[0.55em] text-[#A07860] mb-4 uppercase"
          style={{ fontFamily: "'Mona', sans-serif" }}
        >
          presents
        </p>
        <div className="w-20 h-px bg-[#C8A08A] mx-auto mb-5" />
        <h1
          className="text-center text-[56px] leading-tight text-[#3D2B1E]"
          style={{ fontFamily: "'Mona', sans-serif" }}
        >
          스웨덴세탁소
        </h1>
        <div className="w-20 h-px bg-[#C8A08A] mx-auto mt-5 mb-4" />
        <p
          className="text-center text-[11px] tracking-[0.4em] text-[#A07860] uppercase"
          style={{ fontFamily: "'Mona', sans-serif" }}
        >
          Sweden Laundry
        </p>
      </div>

      {/* Enter button */}
      <button
        onClick={onEnter}
        className="mt-10 text-[#A07860] text-[11px] tracking-[0.45em] uppercase transition-colors hover:text-[#3D2B1E] cursor-pointer animate-pulse"
        style={{ fontFamily: "'Mona', sans-serif" }}
      >
        ↓ &nbsp;Enter the Laundry&nbsp; ↓
      </button>
    </div>
  )
}
