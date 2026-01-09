import { EnemyInstance } from '../../types/enemy';
import { HealthBar } from '../common/HealthBar';
import { STATUS_INFO } from '../../types/status';

interface EnemyProps {
  enemy: EnemyInstance;
  isTargetable?: boolean;
}

export function Enemy({ enemy, isTargetable = false }: EnemyProps) {
  const getIntentIcon = () => {
    const baseClass = "flex items-center gap-2 px-4 py-2 rounded-lg";

    switch (enemy.intent.type) {
      case 'ATTACK':
        return (
          <div className={`${baseClass} intent-attack`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.92 5L5 7.77 5.05 9l1.21.39L7.5 8.95l.24-.46-.24-.27L5.92 7 7.69 5.23l1.68.5.33-.86-.07-.38-.71-.49H6.92m7.54-.5a.54.54 0 01.54.54.54.54 0 01-.54.54.54.54 0 01-.54-.54.54.54 0 01.54-.54M11.5 7.5L9.41 9.59 10.83 11l2.09-2.09-1.42-1.41M21 15.46l-3.77-3.77c-.37-.37-.92-.5-1.42-.35l-1.67-1.67a4.16 4.16 0 00.38-1.76c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4c.59 0 1.14-.13 1.64-.35l1.67 1.67c-.15.5-.02 1.05.35 1.42l3.77 3.77c.2.2.45.29.71.29.26 0 .51-.1.71-.29l1.63-1.63c.39-.39.39-1.03 0-1.42z"/>
            </svg>
            <span className="font-title text-lg font-bold text-white">{enemy.intent.damage}</span>
            {enemy.intent.hits && enemy.intent.hits > 1 && (
              <span className="text-sm text-white/70 font-title">x{enemy.intent.hits}</span>
            )}
          </div>
        );
      case 'DEFEND':
        return (
          <div className={`${baseClass} intent-defend`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            <span className="font-title text-lg font-bold text-white">{enemy.intent.block}</span>
          </div>
        );
      case 'BUFF':
        return (
          <div className={`${baseClass} intent-buff`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14l5-5 5 5z"/>
            </svg>
            <span className="font-title text-sm text-white">강화</span>
          </div>
        );
      case 'DEBUFF':
        return (
          <div className={`${baseClass} intent-debuff`}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <span className="font-title text-sm text-white">저주</span>
          </div>
        );
      default:
        return (
          <div className={`${baseClass} bg-[var(--bg-medium)] border-2 border-[var(--gold-dark)]`}>
            <span className="text-lg">❓</span>
          </div>
        );
    }
  };

  const getEnemyEmoji = () => {
    if (enemy.templateId === 'cultist') return '🧙';
    if (enemy.templateId === 'jaw_worm') return '🐛';
    if (enemy.templateId.includes('louse')) return '🐜';
    if (enemy.templateId.includes('slime')) return '🟢';
    if (enemy.templateId === 'gremlin_nob') return '👹';
    if (enemy.templateId === 'slime_boss') return '👿';
    return '👾';
  };

  if (enemy.currentHp <= 0) return null;

  return (
    <div className={`flex flex-col items-center transition-all duration-300 ${isTargetable ? 'scale-105' : ''}`}>
      {/* 인텐트 표시 */}
      <div className="mb-4 animate-float">
        {getIntentIcon()}
      </div>

      {/* 적 본체 */}
      <div className="relative">
        {/* 타겟팅 글로우 */}
        {isTargetable && (
          <div
            className="absolute -inset-6 rounded-2xl animate-target"
            style={{
              background: 'radial-gradient(ellipse, rgba(224, 64, 64, 0.3) 0%, transparent 70%)',
            }}
          />
        )}

        {/* 적 프레임 */}
        <div
          className={`
            relative w-36 h-44 rounded-xl flex items-center justify-center
            transition-all duration-200
            ${enemy.block > 0 ? 'ring-2 ring-[var(--block-light)]' : ''}
          `}
          style={{
            background: 'linear-gradient(180deg, rgba(30,28,35,0.95) 0%, rgba(15,13,20,0.98) 100%)',
            border: isTargetable ? '3px solid var(--attack-light)' : '2px solid rgba(100,90,80,0.4)',
            boxShadow: isTargetable
              ? '0 0 30px var(--attack-glow), 0 8px 32px rgba(0,0,0,0.6)'
              : '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          {/* 내부 장식 프레임 */}
          <div className="absolute inset-2 rounded-lg border border-white/5" />

          {/* 적 이미지 */}
          <span
            className="text-7xl drop-shadow-2xl transition-transform duration-200"
            style={{
              transform: isTargetable ? 'scale(1.1)' : 'scale(1)',
              filter: isTargetable ? 'drop-shadow(0 0 10px rgba(224,64,64,0.5))' : 'none',
            }}
          >
            {getEnemyEmoji()}
          </span>

          {/* 블록 오버레이 */}
          {enemy.block > 0 && (
            <div className="absolute inset-0 rounded-xl bg-[var(--block)]/15 pointer-events-none" />
          )}
        </div>

        {/* 블록 표시 */}
        {enemy.block > 0 && (
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--block-light) 0%, var(--block-dark) 100%)',
              border: '2px solid var(--block-bright)',
              boxShadow: '0 0 15px rgba(40, 102, 168, 0.6)',
            }}
          >
            <span className="font-title text-sm font-bold text-white">{enemy.block}</span>
          </div>
        )}

        {/* 그림자 */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-4"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 이름 */}
      <div className="mt-4 font-title text-sm text-[var(--gold-light)] tracking-wide">
        {enemy.name}
      </div>

      {/* 체력바 */}
      <div className="w-36 mt-2">
        <HealthBar
          current={enemy.currentHp}
          max={enemy.maxHp}
          block={0}
          size="sm"
          showNumbers
        />
      </div>

      {/* 상태 효과 */}
      {enemy.statuses.length > 0 && (
        <div className="flex gap-1.5 mt-2 flex-wrap justify-center max-w-36">
          {enemy.statuses.map((status, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs font-bold
                ${STATUS_INFO[status.type].isDebuff ? 'status-debuff' : 'status-buff'}
              `}
              title={STATUS_INFO[status.type].description}
            >
              {status.type === 'VULNERABLE' && <span>💔</span>}
              {status.type === 'WEAK' && <span>😫</span>}
              {status.type === 'STRENGTH' && <span>💪</span>}
              {status.type === 'POISON' && <span>☠️</span>}
              <span className="text-white font-title">{status.stacks}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
