import { useGameStore } from '../stores/gameStore';

export function MainMenu() {
  const { startNewGame, startDeckBuilding } = useGameStore();

  return (
    <div className="w-full h-screen bg-[var(--bg-darkest)] texture-noise vignette flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 장식 패턴 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 50px,
              rgba(201, 162, 39, 0.1) 50px,
              rgba(201, 162, 39, 0.1) 100px
            )`
          }}
        />
      </div>

      {/* 상단 장식 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent" />

      {/* 타이틀 섹션 */}
      <div className="text-center mb-6 sm:mb-12 relative z-10">
        {/* 장식 라인 */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-6">
          <div className="w-12 sm:w-24 h-px bg-gradient-to-r from-transparent to-[var(--gold)]" />
          <div className="text-[var(--gold)] text-lg sm:text-2xl">⚔</div>
          <div className="w-12 sm:w-24 h-px bg-gradient-to-l from-transparent to-[var(--gold)]" />
        </div>

        {/* 메인 타이틀 */}
        <h1 className="font-title text-4xl sm:text-5xl md:text-7xl text-[var(--gold-light)] mb-2 sm:mb-4 drop-shadow-lg"
          style={{
            textShadow: '0 0 40px rgba(201, 162, 39, 0.5), 0 0 80px rgba(201, 162, 39, 0.3), 0 4px 8px rgba(0,0,0,0.8)'
          }}
        >
          SPIRE CLONE
        </h1>

        {/* 서브 타이틀 */}
        <p className="font-card text-sm sm:text-lg md:text-xl text-[var(--gold)] tracking-widest uppercase opacity-80">
          Deckbuilding Roguelike
        </p>

        {/* 하단 장식 라인 */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-6">
          <div className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-[var(--gold-dark)]" />
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rotate-45 bg-[var(--gold-dark)]" />
          <div className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-[var(--gold-dark)]" />
        </div>
      </div>

      {/* 메인 메뉴 버튼들 */}
      <div className="flex flex-col gap-2 sm:gap-4 relative z-10">
        {/* 새 게임 버튼 */}
        <button
          onClick={startNewGame}
          className="btn-game glow-gold min-w-[200px] sm:min-w-[280px] text-base sm:text-xl group relative py-2 sm:py-3"
        >
          <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">⚔</span>
            새로운 여정
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">⚔</span>
          </span>
        </button>

        {/* 덱 빌딩 버튼 */}
        <button
          onClick={startDeckBuilding}
          className="btn-game min-w-[200px] sm:min-w-[280px] text-sm sm:text-lg group relative py-2 sm:py-3"
        >
          <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">🃏</span>
            덱 빌딩 모드
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">🃏</span>
          </span>
        </button>

        {/* 이어하기 버튼 */}
        <button
          disabled
          className="btn-game min-w-[200px] sm:min-w-[280px] text-sm sm:text-lg opacity-40 cursor-not-allowed py-2 sm:py-3"
        >
          이어하기
          <span className="text-xs ml-2 text-[var(--gold-dark)]">(준비중)</span>
        </button>

        {/* 설정 버튼 */}
        <button
          disabled
          className="btn-game min-w-[200px] sm:min-w-[280px] text-sm sm:text-lg opacity-40 cursor-not-allowed py-2 sm:py-3"
        >
          설정
          <span className="text-xs ml-2 text-[var(--gold-dark)]">(준비중)</span>
        </button>
      </div>

      {/* 하단 정보 */}
      <div className="absolute bottom-4 sm:bottom-8 text-center z-10">
        <p className="font-card text-xs sm:text-sm text-[var(--gold-dark)] opacity-60">
          TypeScript + React + Zustand
        </p>
        <p className="font-card text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-40 mt-1">
          v0.1.0 PROTOTYPE
        </p>
      </div>

      {/* 모서리 장식 - 모바일에서 숨김 */}
      <div className="hidden sm:block absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-[var(--gold-dark)] opacity-30" />
      <div className="hidden sm:block absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-[var(--gold-dark)] opacity-30" />
      <div className="hidden sm:block absolute bottom-20 left-8 w-16 h-16 border-l-2 border-b-2 border-[var(--gold-dark)] opacity-30" />
      <div className="hidden sm:block absolute bottom-20 right-8 w-16 h-16 border-r-2 border-b-2 border-[var(--gold-dark)] opacity-30" />

      {/* 하단 장식 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--gold-dark)] to-transparent" />
    </div>
  );
}
