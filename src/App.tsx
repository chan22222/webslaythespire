import { useState, useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { useAuthStore } from './stores/authStore';
import { MainMenu } from './components/MainMenu';
import { MapScreen } from './components/map/MapScreen';
import { CombatScreen } from './components/combat/CombatScreen';
import { CardRewardScreen } from './components/reward/CardRewardScreen';
import { RestScreen } from './components/rest/RestScreen';
import { ShopScreen } from './components/shop/ShopScreen';
import { GameOver } from './components/GameOver';
import { DeckBuildingScreen } from './components/deckbuilding/DeckBuildingScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { AchievementNotification } from './components/combat/AchievementNotification';

// 로딩 화면 컴포넌트 - 던전 러너 스타일
function LoadingScreen({ onLoadComplete }: { onLoadComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [runFrame, setRunFrame] = useState(0);

  // 도착 애니메이션 상태
  const [isArrived, setIsArrived] = useState(false);
  // 마지막 프레임(앉은 상태)에서 시작하여 애니메이션 없이 바로 고정
  const [arrivalComplete, setArrivalComplete] = useState(false);

  // 배경 파티클 위치 고정 (초기화 시 한번만 생성)
  const [bgParticles] = useState(() =>
    [...Array(15)].map((_, i) => ({
      id: i,
      size: 4 + (i % 3) * 2,
      left: 5 + (i * 7) % 90,
      top: 10 + (i * 11) % 80,
      duration: 2.5 + (i % 4),
      delay: (i * 0.25) % 2,
      opacity: 0.7 + (i % 3) * 0.15,
    }))
  );

  // 스프라이트 설정 (4x4 그리드, 256x256)
  const RUN_FRAMES = 6; // 0~5 프레임 (달리기)
  const IDLE_FRAMES = 6; // 0~5 프레임 (idle)
  const SPRITE_WIDTH = 256;
  const SPRITE_HEIGHT = 256;
  const SPRITE_COLUMNS = 4;
  const SPRITE_SCALE = 0.35;
  const [idleFrame, setIdleFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const increment = Math.random() * 12 + 4;
        return Math.min(100, prev + increment);
      });
    }, 180);
    return () => clearInterval(interval);
  }, []);

  // 캐릭터 뛰기 애니메이션 (도착 전)
  useEffect(() => {
    if (isArrived) return;
    const runInterval = setInterval(() => {
      setRunFrame(prev => (prev + 1) % RUN_FRAMES);
    }, 90);
    return () => clearInterval(runInterval);
  }, [isArrived]);

  // 캐릭터 idle 애니메이션 (도착 후)
  useEffect(() => {
    if (!isArrived) return;
    const idleInterval = setInterval(() => {
      setIdleFrame(prev => (prev + 1) % IDLE_FRAMES);
    }, 150);
    return () => clearInterval(idleInterval);
  }, [isArrived]);

  // 50%쯤 되면 도착
  useEffect(() => {
    if (progress >= 50 && !isArrived) {
      setIsArrived(true);
      // 바로 앉은 상태로 고정 (애니메이션 없이)
      setArrivalComplete(true);
    }
  }, [progress, isArrived]);

  // 도착 완료 AND 로딩 100% 후 페이드아웃
  useEffect(() => {
    if (arrivalComplete && progress >= 100) {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(onLoadComplete, 600);
      }, 200);
    }
  }, [arrivalComplete, progress, onLoadComplete]);

  // 바운스 효과 (달리는 프레임에 따라, 도착 후에는 없음)
  const bounceY = isArrived ? 0 : Math.sin(runFrame * 0.8) * 3;

  // 표시용 progress (실제의 2배, 최대 100)
  const displayProgress = Math.min(progress * 2, 100);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-600 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 깊은 던전 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 100%, rgba(139, 90, 43, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at center, #12100f 0%, #0a0908 40%, #050404 100%)
          `,
        }}
      />

      {/* 떠다니는 골드 파티클 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bgParticles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              background: `radial-gradient(circle, rgba(255, 200, 80, ${p.opacity}) 0%, transparent 70%)`,
              animation: `floatParticle ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 타이틀 */}
      <div className="z-10 text-center px-4 mb-1">
        <div className="relative">
          <span
            className="absolute inset-0 block text-xl sm:text-2xl md:text-3xl tracking-[0.08em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#1a1205',
              transform: 'translate(3px, 3px)',
            }}
          >
            SHUFFLE & SLASH
          </span>
          <span
            className="absolute inset-0 block text-xl sm:text-2xl md:text-3xl tracking-[0.08em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#ffc830',
              filter: 'blur(12px)',
              opacity: 0.4,
            }}
          >
            SHUFFLE & SLASH
          </span>
          <span
            className="relative block text-xl sm:text-2xl md:text-3xl tracking-[0.08em]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              background: 'linear-gradient(175deg, #fff4d0 0%, #ffd860 15%, #ffca28 35%, #e5a820 55%, #c48c18 75%, #a06a10 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 8px rgba(255, 200, 48, 0.5)) drop-shadow(2px 2px 0 #3d2a08)',
            }}
          >
            SHUFFLE & SLASH
          </span>
        </div>
      </div>

      {/* 메인 로딩 영역 */}
      <div className="w-[320px] sm:w-[400px] md:w-[500px] lg:w-[600px] z-10 relative">

        {/* 캐릭터 러닝 존 */}
        <div className="relative h-32 mb-2">
          {/* 뛰는 캐릭터 */}
          <div
            className="absolute"
            style={{
              left: isArrived ? '90%' : `${Math.min(progress * 2, 90)}%`,
              bottom: '12px',
              transform: `translateX(-50%) translateY(${bounceY}px)`,
              transition: 'left 0.18s ease-out',
            }}
          >
            {/* 하트 파티클 (도착 시) */}
            {isArrived && (
              <div
                className="absolute pointer-events-none text-lg"
                style={{
                  left: '30%',
                  bottom: '80%',
                  opacity: 0,
                  animation: 'heartFloat 1.6s ease-out infinite',
                  animationDelay: '0.4s',
                  animationFillMode: 'forwards',
                }}
              >
                ❤️
              </div>
            )}

            {/* 캐릭터 글로우 */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: isArrived
                  ? 'radial-gradient(ellipse at center bottom, rgba(255, 100, 100, 0.4) 0%, transparent 60%)'
                  : 'radial-gradient(ellipse at center bottom, rgba(255, 180, 50, 0.4) 0%, transparent 60%)',
                transform: 'scale(1.8) translateY(20%)',
                filter: 'blur(8px)',
              }}
            />
            {/* 스프라이트 */}
            <div
              style={{
                width: SPRITE_WIDTH * SPRITE_SCALE,
                height: SPRITE_HEIGHT * SPRITE_SCALE,
                backgroundImage: isArrived
                  ? 'url(/sprites/character_sprite_1.png)'
                  : 'url(/sprites/character_sprite_dash.png)',
                backgroundSize: `${SPRITE_WIDTH * SPRITE_COLUMNS * SPRITE_SCALE}px auto`,
                backgroundPosition: (() => {
                  const frame = isArrived ? idleFrame : runFrame;
                  const col = frame % SPRITE_COLUMNS;
                  const row = Math.floor(frame / SPRITE_COLUMNS);
                  return `-${col * SPRITE_WIDTH * SPRITE_SCALE}px -${row * SPRITE_HEIGHT * SPRITE_SCALE}px`;
                })(),
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 20px rgba(255, 180, 50, 0.3))',
              }}
            />
          </div>

          {/* 도착 지점 보물 아이콘 */}
          <div
            className="absolute right-0 bottom-3"
            style={{
              opacity: progress > 70 ? 1 : 0.3,
              transition: 'opacity 0.3s',
            }}
          >
            <div
              className="relative"
              style={{
                animation: progress > 90 ? 'treasurePulse 0.5s ease-in-out infinite' : 'none',
              }}
            >
              {/* 보물 글로우 */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6) 0%, transparent 70%)',
                  transform: 'scale(2.5)',
                  filter: 'blur(10px)',
                }}
              />
              {/* 보물 아이콘 */}
              <div
                className="relative text-3xl"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(255, 200, 0, 0.8))',
                }}
              >
                💎
              </div>
            </div>
          </div>
        </div>

        {/* 로딩바 */}
        <div className="relative">
          {/* 로딩바 외곽 프레임 */}
          <div
            className="relative h-5 rounded-sm overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1a1612 0%, #0d0b09 100%)',
              border: '2px solid #3d3225',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)',
            }}
          >
            {/* 프로그레스 바 */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-150"
              style={{
                width: `${displayProgress}%`,
                background: 'linear-gradient(180deg, #ffd860 0%, #c9a227 50%, #8b7320 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 0 12px rgba(255, 200, 80, 0.5)',
              }}
            />

            {/* 하이라이트 라인 */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 20%, rgba(255,255,255,0.1) 80%, transparent)',
              }}
            />
          </div>
        </div>

        {/* 로딩 정보 */}
        <div className="flex justify-between items-center mt-3 px-1">
          <span
            className="text-[8px] sm:text-[10px]"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#807060',
            }}
          >
            {displayProgress < 100 ? 'NOW LOADING' : 'COMPLETE!'}
          </span>
          <span
            className="text-[10px] sm:text-xs"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              color: '#ffd860',
              textShadow: '0 0 8px rgba(255, 200, 80, 0.5)',
            }}
          >
            {Math.floor(displayProgress)}%
          </span>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.8;
          }
        }
        @keyframes treasurePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        @keyframes heartFloat {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translateY(-10px) scale(1);
          }
          100% {
            transform: translateY(-50px) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function App() {
  const { phase } = useGameStore();
  const { showLoginScreen, isInitialized, initialize } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // 인증 초기화
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      {/* 로딩 화면 */}
      {isLoading && <LoadingScreen onLoadComplete={() => setIsLoading(false)} />}

      {/* 로그인 화면 - 로딩 완료 후 표시 */}
      {!isLoading && isInitialized && showLoginScreen && <LoginScreen />}

      {/* 세로 모드 회전 안내 */}
      <div className="rotate-device-overlay">
        <div className="text-6xl mb-6 animate-bounce">📱</div>
        <div className="font-title text-xl mb-2">화면을 가로로 회전해주세요</div>
        <div className="font-card text-sm text-gray-400">Please rotate your device</div>
      </div>

      <div className="game-content w-full min-h-screen bg-gray-900">
      {/* 업적 달성 알림 (전역) */}
      <AchievementNotification />

      {phase === 'MAIN_MENU' && !isLoading && !showLoginScreen && <MainMenu />}
      {phase === 'DECK_BUILDING' && <DeckBuildingScreen />}
      {phase === 'MAP' && <MapScreen />}
      {phase === 'COMBAT' && <CombatScreen />}
      {phase === 'CARD_REWARD' && <CardRewardScreen />}
      {phase === 'REWARD' && <CardRewardScreen />}
      {phase === 'REST' && <RestScreen />}
      {phase === 'SHOP' && <ShopScreen />}
      {phase === 'GAME_OVER' && <GameOver />}
      {phase === 'EVENT' && (
        <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">❓</div>
            <h1 className="text-2xl text-white mb-4">이벤트 (준비중)</h1>
            <button
              onClick={() => useGameStore.getState().setPhase('MAP')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
            >
              건너뛰기
            </button>
          </div>
        </div>
      )}
      {phase === 'VICTORY' && (
        <div className="w-full h-screen bg-gradient-to-b from-gray-900 to-yellow-950 flex flex-col items-center justify-center">
          <div className="text-9xl mb-8">🏆</div>
          <h1 className="text-6xl font-bold text-yellow-400 mb-4">승리!</h1>
          <p className="text-xl text-gray-300 mb-8">첨탑을 정복했습니다!</p>
          <button
            onClick={() => useGameStore.getState().setPhase('MAIN_MENU')}
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-xl rounded-lg"
          >
            메인 메뉴로
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
