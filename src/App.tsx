import { useGameStore } from './stores/gameStore';
import { MainMenu } from './components/MainMenu';
import { MapScreen } from './components/map/MapScreen';
import { CombatScreen } from './components/combat/CombatScreen';
import { CardRewardScreen } from './components/reward/CardRewardScreen';
import { RestScreen } from './components/rest/RestScreen';
import { ShopScreen } from './components/shop/ShopScreen';
import { GameOver } from './components/GameOver';

function App() {
  const { phase } = useGameStore();

  return (
    <>
      {/* 세로 모드 회전 안내 */}
      <div className="rotate-device-overlay">
        <div className="text-6xl mb-6 animate-bounce">📱</div>
        <div className="font-title text-xl mb-2">화면을 가로로 회전해주세요</div>
        <div className="font-card text-sm text-gray-400">Please rotate your device</div>
      </div>

      <div className="game-content w-full min-h-screen bg-gray-900">
      {phase === 'MAIN_MENU' && <MainMenu />}
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
    </>
  );
}

export default App;
