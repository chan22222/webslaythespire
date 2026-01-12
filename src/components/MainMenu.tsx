import { useGameStore } from '../stores/gameStore';

// 타이틀 컴포넌트 - 아케이드 스타일
function AnimatedTitle() {
  return (
    <div className="relative text-center">
      {/* 메인 타이틀 */}
      <div className="relative">
        {/* Shuffle - 레이어드 텍스트 */}
        <div
          className="relative"
          style={{
            animation: 'titleSlam 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          }}
        >
          {/* 백 섀도우 레이어 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.2em] sm:tracking-[0.25em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#2a1800',
              transform: 'translate(6px, 6px)',
              WebkitTextStroke: '2px #1a0f00',
            }}
          >
            SHUFFLE
          </span>
          {/* 미드 글로우 레이어 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.2em] sm:tracking-[0.25em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: 'var(--gold)',
              filter: 'blur(8px)',
              opacity: 0.8,
            }}
          >
            SHUFFLE
          </span>
          {/* 메인 텍스트 레이어 */}
          <span
            className="relative block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.2em] sm:tracking-[0.25em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              background: 'linear-gradient(180deg, #fff8e0 0%, #ffd700 25%, #daa520 50%, #b8860b 75%, #8b6914 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 10px var(--gold-glow)) drop-shadow(2px 2px 0 #000)',
            }}
          >
            SHUFFLE
          </span>
        </div>

        {/* &Slash - 레이어드 텍스트 */}
        <div
          className="relative mt-1 sm:mt-2"
          style={{
            animation: 'titleSlam 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.15s forwards',
            opacity: 0,
          }}
        >
          {/* 백 섀도우 레이어 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.2em] sm:tracking-[0.25em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#2a0000',
              transform: 'translate(6px, 6px)',
              WebkitTextStroke: '2px #1a0000',
            }}
          >
            &SLASH
          </span>
          {/* 미드 글로우 레이어 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.2em] sm:tracking-[0.25em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: 'var(--attack)',
              filter: 'blur(8px)',
              opacity: 0.8,
            }}
          >
            &SLASH
          </span>
          {/* 메인 텍스트 레이어 */}
          <span
            className="relative block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.2em] sm:tracking-[0.25em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              background: 'linear-gradient(180deg, #ffcccc 0%, #ff6b6b 25%, #e04040 50%, #b82525 75%, #7a1818 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 10px var(--attack-glow)) drop-shadow(2px 2px 0 #000)',
            }}
          >
            &SLASH
          </span>
        </div>

        {/* 글로우 펄스 오버레이 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, var(--gold-glow) 0%, transparent 70%)',
            animation: 'titlePulse 2s ease-in-out 1s infinite',
            opacity: 0,
          }}
        />
      </div>

      {/* 서브타이틀 */}
      <p
        className="text-[8px] sm:text-[10px] md:text-xs text-[var(--gold)] mt-8 sm:mt-10 tracking-[0.4em] sm:tracking-[0.5em]"
        style={{
          fontFamily: '"Press Start 2P", monospace',
          textShadow: '0 0 10px var(--gold-glow), 2px 2px 0 #000',
          animation: 'fadeInUp 0.5s ease-out 0.5s forwards',
          opacity: 0,
        }}
      >
        DECKBUILDING ROGUELIKE
      </p>

      {/* 장식 라인 */}
      <div className="flex items-center justify-center gap-4 mt-4"
        style={{
          animation: 'fadeIn 0.5s ease-out 0.7s forwards',
          opacity: 0,
        }}
      >
        <div className="h-[2px] w-16 sm:w-24 bg-gradient-to-r from-transparent via-[var(--gold)] to-[var(--gold)]" />
        <div className="w-2 h-2 rotate-45 bg-[var(--gold)]" style={{ boxShadow: '0 0 10px var(--gold-glow)' }} />
        <div className="h-[2px] w-16 sm:w-24 bg-gradient-to-l from-transparent via-[var(--gold)] to-[var(--gold)]" />
      </div>
    </div>
  );
}

// 떠다니는 파티클 배경
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: Math.random() * 10 + 15,
    opacity: Math.random() * 0.3 + 0.1,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-[var(--gold)]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            opacity: p.opacity,
            animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function MainMenu() {
  const { startNewGame, startDeckBuilding } = useGameStore();

  return (
    <div className="w-full h-screen bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
      {/* 메인 배경 이미지 - 세로 기준 채우기 */}
      <img
        src="/main.webp"
        alt="Shuffle & Slash"
        className="absolute h-full w-auto left-1/2 -translate-x-1/2"
        style={{
          imageRendering: 'pixelated',
        }}
      />

      {/* 동적 파티클 배경 */}
      <FloatingParticles />

      {/* 타이틀 텍스트 */}
      <div className="absolute top-[12%] sm:top-[15%] z-10 text-center px-4">
        <AnimatedTitle />
      </div>

      {/* 메인 메뉴 버튼들 - 하단 배치 */}
      <div className="absolute bottom-16 sm:bottom-24 flex flex-col gap-2 sm:gap-3 z-10">
        {/* 새 게임 버튼 */}
        <button
          onClick={startNewGame}
          className="relative transition-all duration-150 hover:scale-105 hover:brightness-125"
        >
          <img
            src="/button_long.png"
            alt=""
            className="w-[160px] sm:w-[200px] h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-sm sm:text-base"
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              textShadow: '2px 2px 0 #000',
            }}
          >
            새로운 여정
          </span>
        </button>

        {/* 덱 빌딩 버튼 */}
        <button
          onClick={startDeckBuilding}
          className="relative transition-all duration-150 hover:scale-105 hover:brightness-125"
        >
          <img
            src="/button_long.png"
            alt=""
            className="w-[160px] sm:w-[200px] h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-sm sm:text-base"
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              textShadow: '2px 2px 0 #000',
            }}
          >
            덱 빌딩
          </span>
        </button>

        {/* 이어하기 버튼 */}
        <button
          disabled
          className="relative opacity-50 cursor-not-allowed"
        >
          <img
            src="/button_long.png"
            alt=""
            className="w-[160px] sm:w-[200px] h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-sm sm:text-base"
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              textShadow: '2px 2px 0 #000',
            }}
          >
            이어하기
          </span>
        </button>

        {/* 설정 버튼 */}
        <button
          disabled
          className="relative opacity-50 cursor-not-allowed"
        >
          <img
            src="/button_long.png"
            alt=""
            className="w-[160px] sm:w-[200px] h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-sm sm:text-base"
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              textShadow: '2px 2px 0 #000',
            }}
          >
            설정
          </span>
        </button>
      </div>

      {/* 하단 버전 정보 */}
      <div className="absolute bottom-4 sm:bottom-6 text-center z-10">
        <p
          className="text-[8px] sm:text-[10px] text-[var(--gold-dark)] opacity-60"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          v0.1.0 PROTOTYPE
        </p>
      </div>
    </div>
  );
}
