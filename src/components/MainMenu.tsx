import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { playButtonHover, playButtonClick } from '../utils/sound';

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
  const { startNewGame, startDeckBuilding, playerName, setPlayerName, hasSaveData, loadGame, deleteSaveData, checkSaveData, isSaveLoading } = useGameStore();
  const { user, isGuest, signOut, setShowLoginScreen } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const [showWarning, setShowWarning] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const canContinue = !isGuest && hasSaveData;

  // 상습 탈주자 여부 (이어하기로 불러왔을 때 이름이 변경됨)
  const isDeserter = playerName === '상습 탈주자';

  // 로그인 상태 변경 시 저장 데이터 확인
  useEffect(() => {
    if (user && !isGuest) {
      checkSaveData();
    }
  }, [user, isGuest, checkSaveData]);

  const isLoggedIn = !!user;
  const displayName = user?.displayName || user?.email?.split('@')[0] || (isGuest ? '게스트' : '');

  const handleNewGame = () => {
    if (canContinue) {
      setShowWarning(true);
    } else {
      // 이미 이름이 설정되어 있으면 바로 시작
      if (playerName !== '모험가') {
        startNewGame();
      } else {
        setNewGameName('');
        setShowNameInput(true);
      }
    }
  };

  const confirmNewGame = async () => {
    await deleteSaveData();
    setShowWarning(false);
    // 이미 이름이 설정되어 있으면 바로 시작
    if (playerName !== '모험가') {
      startNewGame();
    } else {
      setNewGameName('');
      setShowNameInput(true);
    }
  };

  const startGameWithName = () => {
    if (newGameName.trim()) {
      // "상습 탈주자"를 직접 입력하면 "관종"으로 변경
      const finalName = newGameName.trim() === '상습 탈주자' ? '관종' : newGameName.trim();
      setPlayerName(finalName);
    }
    setShowNameInput(false);
    startNewGame();
  };

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* 블랙홀 소용돌이 배경 */}
      <BlackholeBackground />

      {/* 우측 상단 로그인/로그아웃 버튼 */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {(isLoggedIn || isGuest) && (
          <span
            className="text-xs opacity-70"
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              color: 'var(--gold-light)',
            }}
          >
            {isGuest ? '게스트' : displayName}
          </span>
        )}
        {isLoggedIn ? (
          <button
            onMouseEnter={playButtonHover}
            onClick={() => { playButtonClick(); signOut(); }}
            className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105 hover:brightness-125"
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              background: 'linear-gradient(180deg, #3a2020 0%, #1a0a0a 100%)',
              border: '1px solid #6b3030',
              color: '#ff8080',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            로그아웃
          </button>
        ) : isGuest ? (
          <button
            onMouseEnter={playButtonHover}
            onClick={() => { playButtonClick(); setShowLoginScreen(true); }}
            className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105 hover:brightness-125"
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              background: 'linear-gradient(180deg, #2a3520 0%, #1a2510 100%)',
              border: '1px solid #4a6030',
              color: '#a0d080',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }}
          >
            로그인
          </button>
        ) : null}
      </div>

      {/* 타이틀 텍스트 */}
      <div className="menu-title absolute top-[15%] sm:top-[18%] z-10 text-center px-4">
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
              setTempName(playerName === '모험가' || isDeserter ? '' : playerName);
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
                  const finalName = tempName.trim() === '상습 탈주자' ? '관종' : tempName;
                  setPlayerName(finalName);
                  setIsEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const finalName = tempName.trim() === '상습 탈주자' ? '관종' : tempName;
                    setPlayerName(finalName);
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
                className={`text-sm transition-all duration-300 relative z-10 ${!isDeserter && playerName === '모험가' ? 'opacity-60' : ''} ${!isDeserter ? 'group-hover:text-[var(--gold)]' : ''}`}
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                  color: isDeserter ? '#ff4444' : 'var(--gold-light)',
                  textShadow: isDeserter ? '0 0 8px rgba(255, 68, 68, 0.6)' : '0 0 6px var(--gold-glow)',
                }}
              >
                <span className={`${!isDeserter ? 'group-hover:drop-shadow-[0_0_8px_var(--gold-glow)]' : ''} transition-all duration-300`}>
                  {isDeserter ? '상습 탈주자' : (playerName === '모험가' ? '당신의 이름을 알려주세요' : playerName)}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 메인 메뉴 버튼들 - 하단 배치 */}
      <div className="menu-buttons absolute bottom-32 sm:bottom-40 flex flex-col gap-2 sm:gap-3 z-10 items-center">
        {/* 새 게임 버튼 */}
        <button
          onMouseEnter={playButtonHover}
          onClick={() => { playButtonClick(); handleNewGame(); }}
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

        {/* 이어하기 버튼 */}
        <button
          onMouseEnter={() => canContinue && !isSaveLoading && playButtonHover()}
          onClick={() => { if (canContinue && !isSaveLoading) { playButtonClick(); loadGame(); } }}
          disabled={!canContinue || isSaveLoading}
          className={`relative ${canContinue && !isSaveLoading ? 'transition-all duration-150 hover:scale-105 hover:brightness-125' : 'cursor-not-allowed'}`}
          style={{
            animation: 'buttonFadeIn 0.5s ease-out 0.6s forwards',
            opacity: 0,
          }}
        >
          <img
            src="/button_long.png"
            alt=""
            className={`w-[160px] sm:w-[200px] h-auto ${!canContinue || isSaveLoading ? 'opacity-50' : ''}`}
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className={`absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-sm sm:text-base ${!canContinue || isSaveLoading ? 'opacity-50' : ''}`}
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              textShadow: '2px 2px 0 #000',
            }}
          >
            {isSaveLoading ? '불러오는 중...' : '이어하기'}
          </span>
        </button>

        {/* 덱 빌딩 버튼 */}
        <button
          onMouseEnter={playButtonHover}
          onClick={() => { playButtonClick(); startDeckBuilding(); }}
          className="relative transition-all duration-150 hover:scale-105 hover:brightness-125"
          style={{
            animation: 'buttonFadeIn 0.5s ease-out 0.7s forwards',
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
            연습 모드
          </span>
        </button>
      </div>

      {/* 경고 모달 */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div
            className="relative p-6 rounded-lg border-2 border-[var(--gold-dark)] max-w-sm mx-4"
            style={{
              background: 'linear-gradient(180deg, #1a1510 0%, #0d0a08 100%)',
              boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(212,168,75,0.1)',
            }}
          >
            <h3
              className="text-[var(--gold)] text-center mb-4"
              style={{
                fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                textShadow: '0 0 10px var(--gold-glow)',
              }}
            >
              경고
            </h3>
            <p
              className="text-[var(--gold-light)] text-sm text-center mb-6"
              style={{
                fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              }}
            >
              진행 중인 게임이 있습니다.<br />
              새로운 게임을 시작하면 저장된 데이터가 삭제됩니다.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onMouseEnter={playButtonHover}
                onClick={() => { playButtonClick(); setShowWarning(false); }}
                className="px-4 py-2 rounded border border-[var(--gold-dark)] text-[var(--gold-light)] text-sm hover:bg-[var(--gold-dark)]/20 transition-colors"
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                }}
              >
                취소
              </button>
              <button
                onMouseEnter={playButtonHover}
                onClick={() => { playButtonClick(); confirmNewGame(); }}
                className="px-4 py-2 rounded bg-red-900/80 border border-red-700 text-red-200 text-sm hover:bg-red-800/80 transition-colors"
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                }}
              >
                새로 시작
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이름 입력 모달 */}
      {showNameInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div
            className="relative p-6 rounded-lg border-2 border-[var(--gold-dark)] max-w-sm mx-4"
            style={{
              background: 'linear-gradient(180deg, #1a1510 0%, #0d0a08 100%)',
              boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(212,168,75,0.1)',
            }}
          >
            <h3
              className="text-[var(--gold)] text-center mb-4"
              style={{
                fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                textShadow: '0 0 10px var(--gold-glow)',
              }}
            >
              모험가의 이름
            </h3>
            <p
              className="text-[var(--gold-light)] text-xs text-center mb-4 opacity-70"
              style={{
                fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              }}
            >
              입력하지 않으면 "모험가"로 표시됩니다
            </p>
            <input
              type="text"
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  startGameWithName();
                }
              }}
              maxLength={10}
              autoFocus
              placeholder="이름을 입력하세요"
              className="w-full px-3 py-2 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--gold-dark)] text-center mb-4"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--gold-dark)',
                color: 'var(--gold-light)',
                fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              }}
            />
            <div className="flex gap-3 justify-center">
              <button
                onMouseEnter={playButtonHover}
                onClick={() => { playButtonClick(); setShowNameInput(false); }}
                className="px-4 py-2 rounded border border-[var(--gold-dark)] text-[var(--gold-light)] text-sm hover:bg-[var(--gold-dark)]/20 transition-colors"
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                }}
              >
                취소
              </button>
              <button
                onMouseEnter={playButtonHover}
                onClick={() => { playButtonClick(); startGameWithName(); }}
                className="px-4 py-2 rounded bg-[var(--gold-dark)]/30 border border-[var(--gold)] text-[var(--gold-light)] text-sm hover:bg-[var(--gold-dark)]/50 transition-colors"
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                }}
              >
                시작
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 버전 정보 */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 z-10">
        <p
          className="text-[8px] sm:text-[10px] text-[var(--gold-dark)] opacity-60"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          v0.5.0 PROTOTYPE
        </p>
      </div>

      {/* 하단 우측 개인정보 처리방침 */}
      <button
        onClick={() => setShowPrivacy(true)}
        className="absolute bottom-4 sm:bottom-6 right-4 z-10 text-[8px] sm:text-[10px] text-[var(--gold-dark)] opacity-60 hover:opacity-100 transition-opacity"
        style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
      >
        개인정보 처리방침
      </button>

      {/* 개인정보 처리방침 모달 */}
      {showPrivacy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowPrivacy(false)}
        >
          <div
            className="relative p-6 rounded-lg border-2 border-[var(--gold-dark)] max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(180deg, #1a1510 0%, #0d0a08 100%)',
              boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(212,168,75,0.1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3
              className="text-[var(--gold)] text-center mb-4 text-lg"
              style={{
                fontFamily: '"NeoDunggeunmo", cursive',
                textShadow: '0 0 10px var(--gold-glow)',
              }}
            >
              개인정보 처리방침
            </h3>
            <div
              className="text-[var(--gold-light)] text-xs space-y-3"
              style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
            >
              <p><strong>1. 수집하는 개인정보</strong></p>
              <p>본 서비스는 Google 로그인 시 이메일 주소와 표시 이름을 수집합니다. 게스트 모드 이용 시 개인정보를 수집하지 않습니다.</p>

              <p><strong>2. 개인정보의 이용 목적</strong></p>
              <p>수집된 정보는 게임 진행 상황 저장 및 사용자 식별 목적으로만 사용됩니다.</p>

              <p><strong>3. 개인정보의 보관 및 파기</strong></p>
              <p>개인정보는 서비스 이용 기간 동안 보관되며, 회원 탈퇴 시 즉시 파기됩니다.</p>

              <p><strong>4. 제3자 제공</strong></p>
              <p>본 서비스는 수집된 개인정보를 제3자에게 제공하지 않습니다.</p>

              <p><strong>5. 쿠키 및 광고</strong></p>
              <p>본 서비스는 Google AdSense를 통해 광고를 게재하며, 이 과정에서 쿠키가 사용될 수 있습니다. 사용자는 브라우저 설정을 통해 쿠키를 관리할 수 있습니다.</p>

              <p><strong>6. 문의</strong></p>
              <p>개인정보 관련 문의사항은 게임 내 피드백을 통해 접수해 주세요.</p>
            </div>
            <button
              onMouseEnter={playButtonHover}
              onClick={() => { playButtonClick(); setShowPrivacy(false); }}
              className="mt-4 w-full px-4 py-2 rounded border border-[var(--gold-dark)] text-[var(--gold-light)] text-sm hover:bg-[var(--gold-dark)]/20 transition-colors"
              style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
