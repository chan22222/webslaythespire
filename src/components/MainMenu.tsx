import { useState, useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { playButtonHover, playButtonClick, setGlobalVolume, playBGM } from '../utils/sound';
import { StatsPanel } from './stats/StatsPanel';

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
      {/* 타이틀 배경 이미지 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/sprites/title_min.png)',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          animation: 'breatheBg 6s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes breatheBg {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.01);
          }
        }
      `}</style>

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
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showVolumePrompt, setShowVolumePrompt] = useState(false);
  const [volume, setVolume] = useState(100);
  const canContinue = !isGuest && hasSaveData;

  // 상습 탈주자 여부 (이어하기로 불러왔을 때 이름이 변경됨)
  const isDeserter = playerName === '상습 탈주자';

  // 로그인 상태 변경 시 저장 데이터 확인
  useEffect(() => {
    if (user && !isGuest) {
      checkSaveData();
    }
  }, [user, isGuest, checkSaveData]);

  // 세션당 한 번 볼륨 설정 모달 표시
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('volumePromptShown');
    if (!alreadyShown) {
      setShowVolumePrompt(true);
    } else {
      // 이미 설정된 경우 저장된 볼륨 적용
      const savedVolume = localStorage.getItem('gameVolume');
      const vol = savedVolume !== null ? parseInt(savedVolume) : 100;
      setVolume(vol);
      setGlobalVolume(vol / 100);
    }
  }, []);

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
      <div className="menu-buttons absolute bottom-20 sm:bottom-24 flex flex-col gap-2 sm:gap-3 z-10 items-center">
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
            className="w-[150px] sm:w-[185px] h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-base sm:text-lg"
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
            className={`w-[150px] sm:w-[185px] h-auto ${!canContinue || isSaveLoading ? 'opacity-50' : ''}`}
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className={`absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-base sm:text-lg ${!canContinue || isSaveLoading ? 'opacity-50' : ''}`}
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
            className="w-[150px] sm:w-[185px] h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-base sm:text-lg"
            style={{
              fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
              textShadow: '2px 2px 0 #000',
            }}
          >
            연습 모드
          </span>
        </button>

        {/* 통계&업적 버튼 */}
        <StatsPanel
          renderButton={(onClick) => (
            <button
              onMouseEnter={playButtonHover}
              onClick={() => { playButtonClick(); onClick(); }}
              className="relative transition-all duration-150 hover:scale-105 hover:brightness-125"
              style={{
                animation: 'buttonFadeIn 0.5s ease-out 0.8s forwards',
                opacity: 0,
              }}
            >
              <img
                src="/button_long.png"
                alt=""
                className="w-[150px] sm:w-[185px] h-auto"
                style={{ imageRendering: 'pixelated' }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-[var(--gold-light)] text-base sm:text-lg"
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                  textShadow: '2px 2px 0 #000',
                }}
              >
                통계 & 업적
              </span>
            </button>
          )}
        />
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

      {/* 하단 버전 정보 - 가운데 */}
      <div className="menu-footer absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center z-10">
        <p
          className="text-[8px] sm:text-[10px] text-[var(--gold-dark)] opacity-60"
          style={{ fontFamily: '"Press Start 2P", monospace' }}
        >
          v0.6.0
        </p>
      </div>

      {/* 하단 좌측 링크들 */}
      <div className="menu-footer-left absolute bottom-2 sm:bottom-3 left-4 z-10 flex gap-3">
        <button
          onClick={() => setShowAbout(true)}
          className="text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-70 hover:opacity-100 transition-opacity"
          style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
        >
          About
        </button>
        <span className="text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-40">|</span>
        <button
          onClick={() => setShowCredits(true)}
          className="text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-70 hover:opacity-100 transition-opacity"
          style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
        >
          크레딧
        </button>
        <span className="text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-40">|</span>
        <button
          onClick={() => setShowTerms(true)}
          className="text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-70 hover:opacity-100 transition-opacity"
          style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
        >
          이용약관
        </button>
        <span className="text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-40">|</span>
        <button
          onClick={() => setShowPrivacy(true)}
          className="text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-70 hover:opacity-100 transition-opacity"
          style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
        >
          개인정보 처리방침
        </button>
      </div>

      {/* 하단 우측 볼륨 조절 */}
      <div className="menu-footer-right absolute bottom-2 sm:bottom-3 right-4 z-10 flex items-center gap-2">
        <span
          className="text-[10px] sm:text-xs text-[var(--gold-dark)] opacity-70"
          style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
        >
          {volume === 0 ? '🔇' : '🔊'}
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          className="w-16 sm:w-20 h-1 appearance-none bg-[var(--gold-dark)]/30 rounded-full cursor-pointer"
          style={{
            accentColor: 'var(--gold)',
          }}
          onChange={(e) => {
            const vol = parseInt(e.target.value);
            setVolume(vol);
            setGlobalVolume(vol / 100);
            localStorage.setItem('gameVolume', vol.toString());
          }}
        />
      </div>

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

      {/* About 모달 */}
      {showAbout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowAbout(false)}
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
              About
            </h3>
            <div
              className="text-[var(--gold-light)] text-xs space-y-3"
              style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
            >
              <p className="text-center text-base mb-4">🎮 SHUFFLE & SLASH</p>

              <p><strong>게임 소개</strong></p>
              <p>Shuffle & Slash는 덱빌딩 로그라이크 장르의 웹 기반 게임입니다. 카드를 수집하고, 덱을 구축하며, 다양한 적들과 전투를 펼쳐보세요.</p>

              <p><strong>게임 특징</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>전략적인 덱빌딩 시스템</li>
                <li>다양한 카드와 유물</li>
                <li>매 플레이마다 다른 경험</li>
                <li>클라우드 저장 지원</li>
              </ul>

              <p className="text-center opacity-60 mt-4">Made with ❤️</p>
            </div>
            <button
              onMouseEnter={playButtonHover}
              onClick={() => { playButtonClick(); setShowAbout(false); }}
              className="mt-4 w-full px-4 py-2 rounded border border-[var(--gold-dark)] text-[var(--gold-light)] text-sm hover:bg-[var(--gold-dark)]/20 transition-colors"
              style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 이용약관 모달 */}
      {showTerms && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowTerms(false)}
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
              이용약관
            </h3>
            <div
              className="text-[var(--gold-light)] text-xs space-y-3"
              style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
            >
              <p><strong>제1조 (목적)</strong></p>
              <p>본 약관은 Shuffle & Slash(이하 "서비스")의 이용에 관한 조건 및 절차를 규정함을 목적으로 합니다.</p>

              <p><strong>제2조 (서비스의 제공)</strong></p>
              <p>서비스는 무료로 제공되며, 운영자의 판단에 따라 사전 고지 없이 변경되거나 중단될 수 있습니다.</p>

              <p><strong>제3조 (이용자의 의무)</strong></p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>서비스를 불법적인 목적으로 사용해서는 안 됩니다.</li>
                <li>다른 이용자의 서비스 이용을 방해해서는 안 됩니다.</li>
                <li>서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</li>
              </ul>

              <p><strong>제4조 (지적재산권)</strong></p>
              <p>본 서비스의 모든 콘텐츠(디자인, 코드, 그래픽 등)에 대한 저작권은 운영자에게 있습니다. 무단 복제, 배포, 수정은 금지됩니다.</p>

              <p><strong>제5조 (면책조항)</strong></p>
              <p>운영자는 서비스 이용으로 발생하는 어떠한 손해에 대해서도 책임을 지지 않습니다. 게임 데이터의 손실, 서비스 중단 등에 대한 책임은 이용자에게 있습니다.</p>

              <p><strong>제6조 (계정 및 데이터)</strong></p>
              <p>Google 로그인을 통해 생성된 계정의 관리 책임은 이용자에게 있습니다. 게스트 모드 이용 시 게임 데이터는 저장되지 않습니다.</p>

              <p><strong>제7조 (약관의 변경)</strong></p>
              <p>본 약관은 서비스 개선을 위해 사전 고지 후 변경될 수 있습니다.</p>

              <p className="text-center opacity-60 mt-4">시행일: 2026년 1월 16일</p>
            </div>
            <button
              onMouseEnter={playButtonHover}
              onClick={() => { playButtonClick(); setShowTerms(false); }}
              className="mt-4 w-full px-4 py-2 rounded border border-[var(--gold-dark)] text-[var(--gold-light)] text-sm hover:bg-[var(--gold-dark)]/20 transition-colors"
              style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 볼륨 설정 모달 (첫 방문) */}
      {showVolumePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div
            className="relative p-6 rounded-lg border-2 border-[var(--gold-dark)] max-w-sm mx-4"
            style={{
              background: 'linear-gradient(180deg, #1a1510 0%, #0d0a08 100%)',
              boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(212,168,75,0.1)',
            }}
          >
            <h3
              className="text-[var(--gold)] text-center mb-4 text-lg"
              style={{
                fontFamily: '"NeoDunggeunmo", cursive',
                textShadow: '0 0 10px var(--gold-glow)',
              }}
            >
              🔊 사운드 설정
            </h3>
            <p
              className="text-[var(--gold-light)] text-sm text-center mb-6"
              style={{
                fontFamily: '"NeoDunggeunmo", cursive',
              }}
            >
              게임 사운드를 켤까요?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onMouseEnter={playButtonHover}
                onClick={() => {
                  playButtonClick();
                  setVolume(0);
                  setGlobalVolume(0);
                  localStorage.setItem('gameVolume', '0');
                  sessionStorage.setItem('volumePromptShown', 'true');
                  setShowVolumePrompt(false);
                  playBGM('title');
                }}
                className="px-6 py-2 rounded border border-[var(--gold-dark)] text-[var(--gold-light)] text-sm hover:bg-[var(--gold-dark)]/20 transition-colors"
                style={{
                  fontFamily: '"NeoDunggeunmo", cursive',
                }}
              >
                아니오
              </button>
              <button
                onMouseEnter={playButtonHover}
                onClick={() => {
                  // 저장된 볼륨 불러오기 (없거나 0이면 100%)
                  const savedVolume = localStorage.getItem('gameVolume');
                  const savedVol = savedVolume !== null ? parseInt(savedVolume) : 0;
                  const vol = savedVol > 0 ? savedVol : 100;
                  setVolume(vol);
                  setGlobalVolume(vol / 100);
                  localStorage.setItem('gameVolume', vol.toString());
                  sessionStorage.setItem('volumePromptShown', 'true');
                  setShowVolumePrompt(false);
                  playBGM('title');
                  playButtonClick();
                }}
                className="px-6 py-2 rounded bg-[var(--gold-dark)]/30 border border-[var(--gold)] text-[var(--gold-light)] text-sm hover:bg-[var(--gold-dark)]/50 transition-colors"
                style={{
                  fontFamily: '"NeoDunggeunmo", cursive',
                }}
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 크레딧 모달 */}
      {showCredits && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowCredits(false)}
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
              크레딧
            </h3>
            <div
              className="text-[var(--gold-light)] text-xs space-y-4"
              style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
            >
              <div>
                <p className="text-[var(--gold)] mb-2"><strong>🎮 개발</strong></p>
                <p>chan22222</p>
              </div>

              <div>
                <p className="text-[var(--gold)] mb-2"><strong>🎵 음악</strong></p>
                <p>Douglas Gustafson from Pixabay</p>
              </div>

              <div>
                <p className="text-[var(--gold)] mb-2"><strong>🎨 그래픽</strong></p>
                <p>chan22222 & Nanobanana2</p>
              </div>

              <div>
                <p className="text-[var(--gold)] mb-2"><strong>🔊 효과음</strong></p>
                <p>itch.io</p>
              </div>

              <div>
                <p className="text-[var(--gold)] mb-2"><strong>💡 영감</strong></p>
                <p>Slay the Spire by Mega Crit Games</p>
              </div>

              <p className="text-center opacity-60 mt-6">감사합니다!</p>
            </div>
            <button
              onMouseEnter={playButtonHover}
              onClick={() => { playButtonClick(); setShowCredits(false); }}
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
