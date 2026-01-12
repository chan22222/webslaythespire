import { useGameStore } from '../stores/gameStore';

export function MainMenu() {
  const { startNewGame, startDeckBuilding } = useGameStore();

  return (
    <div className="w-full h-screen bg-[#0a0a12] flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 소용돌이 효과 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a12 60%, #050508 100%)',
        }}
      />

      {/* 메인 타이틀 이미지 */}
      <div className="relative z-10 mb-8">
        <img
          src="/main.png"
          alt="Shuffle & Slash"
          className="w-[280px] sm:w-[400px] md:w-[500px] h-auto"
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 30px rgba(201, 162, 39, 0.3))',
          }}
        />
      </div>

      {/* 메인 메뉴 버튼들 */}
      <div className="flex flex-col gap-3 sm:gap-4 relative z-10">
        {/* 새 게임 버튼 */}
        <button
          onClick={startNewGame}
          className="relative group"
        >
          <img
            src="/button_long.png"
            alt=""
            className="w-[180px] sm:w-[220px] h-auto transition-all group-hover:brightness-125 group-hover:scale-105"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-xs sm:text-sm"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '2px 2px 0 #000',
            }}
          >
            새로운 여정
          </span>
        </button>

        {/* 덱 빌딩 버튼 */}
        <button
          onClick={startDeckBuilding}
          className="relative group"
        >
          <img
            src="/button_long.png"
            alt=""
            className="w-[180px] sm:w-[220px] h-auto transition-all group-hover:brightness-125 group-hover:scale-105"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-xs sm:text-sm"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '2px 2px 0 #000',
            }}
          >
            덱 빌딩
          </span>
        </button>

        {/* 이어하기 버튼 */}
        <button
          disabled
          className="relative group opacity-50 cursor-not-allowed"
        >
          <img
            src="/button_long.png"
            alt=""
            className="w-[180px] sm:w-[220px] h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-xs sm:text-sm"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '2px 2px 0 #000',
            }}
          >
            이어하기
          </span>
        </button>

        {/* 설정 버튼 */}
        <button
          disabled
          className="relative group opacity-50 cursor-not-allowed"
        >
          <img
            src="/button_long.png"
            alt=""
            className="w-[180px] sm:w-[220px] h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-xs sm:text-sm"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '2px 2px 0 #000',
            }}
          >
            설정
          </span>
        </button>
      </div>

      {/* 하단 정보 */}
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
