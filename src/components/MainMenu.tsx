import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';

// 파티클 데이터를 컴포넌트 외부에서 한 번만 생성
const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  left: Math.random() * 100,
  delay: Math.random() * 10,
  duration: Math.random() * 10 + 15,
  opacity: Math.random() * 0.3 + 0.1,
}));

// 타이틀 컴포넌트 - 아케이드 스타일
function AnimatedTitle() {
  return (
    <div className="relative text-center">
      {/* 타이틀 뒤 이미지 - 페이드인 후 둥둥 떠다니기 */}
      <div
        className="absolute left-1/2 top-1/2 -z-10"
        style={{
          transform: 'translate(-50%, -68%) scale(3.5)',
          animation: 'fadeIn 1.2s ease-out 1s forwards',
          opacity: 0,
        }}
      >
        <div style={{ animation: 'floatTiny 4s ease-in-out infinite' }}>
          <img
            src="/title_sub.png"
            alt=""
            style={{
              imageRendering: 'pixelated',
              opacity: 0.85,
            }}
          />
        </div>
      </div>

      {/* 메인 타이틀 */}
      <div className="relative" style={{ animation: 'floatSubtle 3.3s ease-in-out infinite' }}>
        {/* Shuffle - 레이어드 텍스트 */}
        <div
          className="relative"
          style={{
            animation: 'titleFadeIn 0.8s ease-out forwards',
            willChange: 'opacity, transform',
          }}
        >
          {/* 깊은 그림자 레이어 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] sm:tracking-[0.1em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#1a1205',
              transform: 'translate(4px, 4px)',
            }}
          >
            SHUFFLE
          </span>
          {/* 외부 글로우 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] sm:tracking-[0.1em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#ffc830',
              filter: 'blur(12px)',
              opacity: 0.25,
            }}
          >
            SHUFFLE
          </span>
          {/* 메인 텍스트 - 프리미엄 골드 */}
          <span
            className="relative block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] sm:tracking-[0.1em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              background: 'linear-gradient(175deg, #fff4d0 0%, #ffd860 15%, #ffca28 35%, #e5a820 55%, #c48c18 75%, #a06a10 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 6px rgba(255, 200, 48, 0.4)) drop-shadow(2px 2px 0 #3d2a08)',
            }}
          >
            SHUFFLE
          </span>
          {/* 하이라이트 오버레이 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] sm:tracking-[0.1em] pointer-events-none"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              background: 'linear-gradient(180deg, rgba(255,248,220,0.3) 0%, transparent 35%, transparent 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SHUFFLE
          </span>
        </div>

        {/* & SLASH - 레이어드 텍스트 */}
        <div
          className="relative mt-1 sm:mt-2"
          style={{
            animation: 'titleFadeIn 0.8s ease-out 0.15s forwards',
            opacity: 0,
            willChange: 'opacity, transform',
          }}
        >
          {/* 깊은 그림자 레이어 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] sm:tracking-[0.1em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#1a1205',
              transform: 'translate(4px, 4px)',
            }}
          >
            & SLASH
          </span>
          {/* 외부 글로우 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] sm:tracking-[0.1em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#ffc830',
              filter: 'blur(12px)',
              opacity: 0.25,
            }}
          >
            & SLASH
          </span>
          {/* 메인 텍스트 - 프리미엄 골드 */}
          <span
            className="relative block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] sm:tracking-[0.1em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              background: 'linear-gradient(175deg, #fff4d0 0%, #ffd860 15%, #ffca28 35%, #e5a820 55%, #c48c18 75%, #a06a10 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 6px rgba(255, 200, 48, 0.4)) drop-shadow(2px 2px 0 #3d2a08)',
            }}
          >
            & SLASH
          </span>
          {/* 하이라이트 오버레이 */}
          <span
            className="absolute inset-0 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[0.08em] sm:tracking-[0.1em] pointer-events-none"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              background: 'linear-gradient(180deg, rgba(255,248,220,0.3) 0%, transparent 35%, transparent 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            & SLASH
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

// 블랙홀 소용돌이 배경
function BlackholeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 깊은 우주 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #15121a 0%, #0a0a10 50%, #000 100%)',
        }}
      />

      {/* 소용돌이 링들 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${(i + 1) * 14}%`,
              height: `${(i + 1) * 14}%`,
              border: `1px solid rgba(212, 168, 75, ${0.08 - i * 0.01})`,
              boxShadow: `0 0 ${12 - i * 2}px rgba(212, 168, 75, ${0.12 - i * 0.015})`,
              animation: `vortexSpin ${15 + i * 5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            }}
          />
        ))}
      </div>

      {/* 중앙 글로우 - 더 강하게 */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,168,75,0.25) 0%, rgba(212,168,75,0.1) 30%, transparent 60%)',
          animation: 'blackholePulse 3s ease-in-out infinite',
        }}
      />

      {/* 떠오르는 파티클들 - 외부에서 정의된 PARTICLES 사용 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
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

      {/* 외곽 비네트 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  );
}

export function MainMenu() {
  const { startNewGame, startDeckBuilding, playerName, setPlayerName } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* 블랙홀 소용돌이 배경 */}
      <BlackholeBackground />

      {/* 타이틀 텍스트 */}
      <div className="absolute top-[15%] sm:top-[18%] z-10 text-center px-4">
        <AnimatedTitle />

        {/* 캐릭터 이름 입력 - 장식 라인 바로 아래 */}
        <div
          className="relative cursor-pointer mt-5 group inline-block"
          style={{
            animation: 'fadeIn 0.5s ease-out 0.9s forwards',
            opacity: 0,
          }}
          onClick={() => {
            if (!isEditing) {
              setTempName(playerName === '모험가' ? '' : playerName);
              setIsEditing(true);
            }
          }}
        >
          {/* 양옆 그라데이션 페이드 효과가 있는 배경 */}
          <div
            className={`relative flex items-center justify-center py-2 transition-all duration-300 ease-out ${isEditing ? 'px-32' : 'px-12'}`}
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(20, 18, 12, 0.5) 10%, rgba(20, 18, 12, 0.5) 90%, transparent 100%)',
            }}
          >
            {/* 호버 시 글로우 효과 */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(212, 168, 75, 0.15) 0%, transparent 70%)',
                filter: 'blur(4px)',
              }}
            />
            {/* 상단/하단 라인 - 그라데이션 */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px] transition-all duration-300 group-hover:shadow-[0_0_8px_var(--gold-glow)]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, var(--gold-dark) 20%, var(--gold-dark) 80%, transparent 100%)',
                opacity: 0.4,
              }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-[1px] transition-all duration-300 group-hover:shadow-[0_0_8px_var(--gold-glow)]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, var(--gold-dark) 20%, var(--gold-dark) 80%, transparent 100%)',
                opacity: 0.4,
              }}
            />

            {isEditing ? (
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={() => {
                  setPlayerName(tempName);
                  setIsEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPlayerName(tempName);
                    setIsEditing(false);
                  }
                }}
                autoFocus
                maxLength={10}
                className="bg-transparent text-center text-[var(--gold-light)] text-sm outline-none w-24"
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                  textShadow: '0 0 6px var(--gold-glow)',
                  caretColor: 'var(--gold)',
                }}
              />
            ) : (
              <span
                className={`text-sm transition-all duration-300 group-hover:text-[var(--gold)] relative z-10 ${playerName === '모험가' ? 'opacity-60' : ''}`}
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                  color: 'var(--gold-light)',
                  textShadow: '0 0 6px var(--gold-glow)',
                }}
              >
                <span className="group-hover:drop-shadow-[0_0_8px_var(--gold-glow)] transition-all duration-300">
                  {playerName === '모험가' ? '당신의 이름을 알려주세요' : playerName}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 메인 메뉴 버튼들 - 하단 배치 */}
      <div className="absolute bottom-32 sm:bottom-40 flex flex-col gap-2 sm:gap-3 z-10 items-center">
        {/* 새 게임 버튼 */}
        <button
          onClick={startNewGame}
          className="relative transition-all duration-150 hover:scale-105 hover:brightness-125"
          style={{
            animation: 'buttonFadeIn 0.5s ease-out 0.5s forwards',
            opacity: 0,
          }}
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
          style={{
            animation: 'buttonFadeIn 0.5s ease-out 0.6s forwards',
            opacity: 0,
          }}
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
            커스텀 모드
          </span>
        </button>

        {/* 이어하기 버튼 */}
        <button
          disabled
          className="relative cursor-not-allowed"
          style={{
            animation: 'buttonFadeIn 0.5s ease-out 0.7s forwards',
            opacity: 0,
          }}
        >
          <img
            src="/button_long.png"
            alt=""
            className="w-[160px] sm:w-[200px] h-auto opacity-50"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-sm sm:text-base opacity-50"
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              textShadow: '2px 2px 0 #000',
            }}
          >
            이어하기
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
