import { Player } from '../../types/player';
import { Status } from '../../types/status';
import { HealthBar } from '../common/HealthBar';
import { STATUS_INFO } from '../../types/status';

interface PlayerStatusProps {
  player: Player;
  block: number;
  statuses: Status[];
}

export function PlayerStatus({ player, block, statuses }: PlayerStatusProps) {
  return (
    <div className="flex flex-col items-center">
      {/* 플레이어 캐릭터 프레임 */}
      <div className="relative">
        {/* 블록 글로우 */}
        {block > 0 && (
          <div
            className="absolute -inset-4 rounded-2xl animate-pulse-glow"
            style={{
              background: 'radial-gradient(ellipse, rgba(40, 102, 168, 0.3) 0%, transparent 70%)',
            }}
          />
        )}

        {/* 메인 프레임 */}
        <div
          className="relative w-28 h-36 rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(30,28,35,0.95) 0%, rgba(15,13,20,0.98) 100%)',
            border: block > 0 ? '3px solid var(--block)' : '3px solid var(--gold-dark)',
            boxShadow: block > 0
              ? '0 0 20px rgba(40, 102, 168, 0.4), 0 8px 24px rgba(0,0,0,0.5)'
              : '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {/* 내부 장식 테두리 */}
          <div className="absolute inset-2 border border-white/5 rounded-lg" />

          {/* 캐릭터 */}
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl drop-shadow-2xl">⚔️</span>
          </div>

          {/* 블록 오버레이 */}
          {block > 0 && (
            <div className="absolute inset-0 bg-[var(--block)]/15 pointer-events-none" />
          )}

          {/* 코너 장식 */}
          <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-[var(--gold)]/50" />
          <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-[var(--gold)]/50" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-[var(--gold)]/50" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-[var(--gold)]/50" />
        </div>

        {/* 블록 뱃지 */}
        {block > 0 && (
          <div
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--block-light) 0%, var(--block-dark) 100%)',
              border: '2px solid var(--block-bright)',
              boxShadow: '0 0 15px rgba(40, 102, 168, 0.6)',
            }}
          >
            <span className="font-title text-sm font-bold text-white">{block}</span>
          </div>
        )}

        {/* 그림자 */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-3"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 체력바 */}
      <div className="w-32 mt-4">
        <HealthBar
          current={player.currentHp}
          max={player.maxHp}
          block={0}
          size="md"
          showNumbers
        />
      </div>

      {/* 상태 효과 */}
      {statuses.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap justify-center max-w-32">
          {statuses.map((status, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                ${STATUS_INFO[status.type].isDebuff ? 'status-debuff' : 'status-buff'}
              `}
              title={`${STATUS_INFO[status.type].name}: ${STATUS_INFO[status.type].description}`}
            >
              {status.type === 'VULNERABLE' && <span>💔</span>}
              {status.type === 'WEAK' && <span>😫</span>}
              {status.type === 'STRENGTH' && <span>💪</span>}
              {status.type === 'DEXTERITY' && <span>🏃</span>}
              {status.type === 'POISON' && <span>☠️</span>}
              <span className="text-white font-title">{status.stacks}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
