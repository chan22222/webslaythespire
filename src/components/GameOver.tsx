import { useGameStore } from '../stores/gameStore';
import { useCombatStore } from '../stores/combatStore';

export function GameOver() {
  const { player, setPhase } = useGameStore();
  const { resetCombat } = useCombatStore();

  const handleRestart = () => {
    resetCombat();
    setPhase('MAIN_MENU');
  };

  return (
    <div className="w-full h-screen bg-[var(--bg-darkest)] texture-noise vignette flex flex-col items-center justify-center relative overflow-hidden">
      {/* 배경 - 어두운 붉은 빛 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(196, 30, 58, 0.15) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* 해골 아이콘 */}
      <div className="relative z-10 mb-8">
        <div
          className="text-9xl animate-float"
          style={{ filter: 'drop-shadow(0 0 30px rgba(196, 30, 58, 0.8))' }}
        >
          💀
        </div>
        {/* 붉은 글로우 */}
        <div
          className="absolute inset-0 -z-10 animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, var(--attack-glow) 0%, transparent 70%)',
            transform: 'scale(2)',
          }}
        />
      </div>

      <h1
        className="font-title text-6xl text-[var(--attack-light)] mb-4 relative z-10"
        style={{
          textShadow: '0 0 40px var(--attack-glow), 0 4px 8px rgba(0,0,0,0.8)',
        }}
      >
        게임 오버
      </h1>

      <p className="font-card text-xl text-gray-400 mb-8 relative z-10">
        당신은 쓰러졌습니다...
      </p>

      {/* 통계 */}
      <div
        className="rounded-xl p-6 mb-8 relative z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)',
          border: '2px solid var(--attack-dark)',
          boxShadow: '0 0 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.3)',
        }}
      >
        <h2 className="font-title text-xl text-[var(--gold-light)] mb-4 text-center">
          게임 통계
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 font-card">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">획득 골드</span>
            <span className="text-[var(--gold-light)] font-bold ml-4">💰 {player.gold}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">덱 카드 수</span>
            <span className="text-white font-bold ml-4">📚 {player.deck.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">유물 수</span>
            <span className="text-[var(--power-light)] font-bold ml-4">✨ {player.relics.length}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleRestart}
        className="px-10 py-4 rounded-xl font-title text-xl text-white relative z-10 transition-all duration-300 hover:scale-105"
        style={{
          background: 'linear-gradient(180deg, var(--attack) 0%, var(--attack-dark) 100%)',
          border: '2px solid var(--attack-light)',
          boxShadow: '0 0 20px var(--attack-glow)',
        }}
      >
        메인 메뉴로
      </button>
    </div>
  );
}
