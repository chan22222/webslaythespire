interface HealthBarProps {
  current: number;
  max: number;
  block?: number;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
  incomingDamage?: number; // 예상 피해량 (방어도 감안 전)
  enemyBlock?: number; // 적의 방어도 (예상 피해 계산용)
}

export function HealthBar({
  current,
  max,
  block = 0,
  showNumbers = true,
  size = 'md',
  incomingDamage = 0,
  enemyBlock = 0,
}: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isCritical = percentage < 15;

  // 예상 피해 계산 (방어도 먼저 차감)
  const effectiveDamage = Math.max(0, incomingDamage - enemyBlock);
  const expectedHp = Math.max(0, current - effectiveDamage);
  const expectedPercentage = Math.max(0, Math.min(100, (expectedHp / max) * 100));
  const willDie = expectedHp <= 0 && incomingDamage > 0;

  const heights = {
    sm: 18,
    md: 24,
    lg: 30,
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const height = heights[size];

  return (
    <div className="w-full relative">
      {/* 체력바 컨테이너 - 빈 HP 바 배경 */}
      <div
        style={{
          height: `${height}px`,
          backgroundImage: 'url(/hp0_combat.png)',
          backgroundSize: '100% 100%',
          position: 'relative',
          imageRendering: 'pixelated',
        }}
      >
        {/* 예상 피해 후 남을 HP (반투명) - 뒤에 깔림 */}
        {incomingDamage > 0 && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: `inset(0 ${100 - percentage}% 0 0)`,
              opacity: 0.4,
            }}
          >
            <img
              src="/hp_combat.png"
              alt=""
              className="w-full h-full"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        )}

        {/* 실제 HP 바 */}
        <div
          className={`absolute inset-0 overflow-hidden transition-all duration-50 ${isCritical && incomingDamage === 0 ? 'animate-pulse' : ''}`}
          style={{
            clipPath: `inset(0 ${100 - (incomingDamage > 0 ? expectedPercentage : percentage)}% 0 0)`,
            zIndex: 1,
          }}
        >
          <img
            src="/hp_combat.png"
            alt=""
            className="w-full h-full"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* 피해 영역 강조선 */}
        {incomingDamage > 0 && expectedPercentage < percentage && (
          <div
            className="absolute h-full animate-pulse"
            style={{
              left: `${expectedPercentage}%`,
              width: '2px',
              background: willDie ? '#fbbf24' : '#fbbf24',
              boxShadow: '0 0 8px rgba(251, 191, 36, 0.8)',
              zIndex: 2,
            }}
          />
        )}

        {/* 숫자 표시 */}
        {showNumbers && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${textSizes[size]} font-bold`}
            style={{ letterSpacing: '0.05em', zIndex: 4 }}
          >
            {incomingDamage > 0 && !willDie ? (
              <>
                <span style={{
                  color: '#fbbf24',
                  textShadow: '0 0 6px rgba(251, 191, 36, 0.8), 0 1px 2px rgba(0,0,0,0.8)',
                  fontWeight: 'bold'
                }}>
                  {expectedHp}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 2px' }}>/</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{max}</span>
              </>
            ) : willDie ? (
              <div className="flex items-center gap-1 animate-pulse">
                <span style={{
                  color: '#ef4444',
                  textShadow: '0 0 8px rgba(239, 68, 68, 0.8), 0 1px 2px rgba(0,0,0,0.8)',
                  fontWeight: 'bold',
                  fontSize: size === 'sm' ? '9px' : '11px',
                }}>
                  KILL
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.9))' }}>
                  <ellipse cx="12" cy="10" rx="8" ry="9" fill="#fbbf24" stroke="#ef4444" strokeWidth="1.5" />
                  <ellipse cx="8.5" cy="9" rx="2.5" ry="3" fill="#1f2937" />
                  <ellipse cx="15.5" cy="9" rx="2.5" ry="3" fill="#1f2937" />
                  <path d="M12 12 L10.5 15 L13.5 15 Z" fill="#1f2937" />
                  <rect x="7" y="17" width="2" height="4" rx="0.5" fill="#fbbf24" stroke="#ef4444" strokeWidth="0.5" />
                  <rect x="10" y="17" width="2" height="4" rx="0.5" fill="#fbbf24" stroke="#ef4444" strokeWidth="0.5" />
                  <rect x="13" y="17" width="2" height="4" rx="0.5" fill="#fbbf24" stroke="#ef4444" strokeWidth="0.5" />
                  <rect x="16" y="17" width="2" height="3" rx="0.5" fill="#fbbf24" stroke="#ef4444" strokeWidth="0.5" />
                  <rect x="4" y="17" width="2" height="3" rx="0.5" fill="#fbbf24" stroke="#ef4444" strokeWidth="0.5" />
                </svg>
              </div>
            ) : (
              <>
                <span style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  {current}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 2px' }}>/</span>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{max}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 블록 표시 */}
      {block > 0 && (
        <div
          className="absolute -right-1 -top-1 flex items-center justify-center"
          style={{
            width: size === 'sm' ? 18 : size === 'md' ? 22 : 26,
            height: size === 'sm' ? 18 : size === 'md' ? 22 : 26,
            borderRadius: '4px',
            background: '#2563eb',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span
            className={`font-bold text-white ${size === 'sm' ? 'text-[9px]' : 'text-[11px]'}`}
          >
            {block}
          </span>
        </div>
      )}
    </div>
  );
}
