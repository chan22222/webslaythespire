interface HealthBarProps {
  current: number;
  max: number;
  block?: number;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function HealthBar({
  current,
  max,
  block = 0,
  showNumbers = true,
  size = 'md',
}: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isLowHealth = percentage < 30;
  const isCritical = percentage < 15;

  const heights = {
    sm: 16,
    md: 22,
    lg: 28,
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const height = heights[size];

  // HP 색상 결정
  const getBarColor = () => {
    if (isCritical) return '#dc2626';
    if (isLowHealth) return '#ef4444';
    return '#b91c1c';
  };

  return (
    <div className="w-full relative">
      {/* 체력바 컨테이너 */}
      <div
        style={{
          height: `${height}px`,
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '3px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* HP 바 */}
        <div
          className={`h-full transition-all duration-300 ${isCritical ? 'animate-pulse' : ''}`}
          style={{
            width: `${percentage}%`,
            background: getBarColor(),
            boxShadow: isCritical ? '0 0 8px rgba(220, 38, 38, 0.5)' : 'none',
          }}
        >
          {/* 상단 하이라이트 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* 숫자 표시 */}
        {showNumbers && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${textSizes[size]} font-bold`}
            style={{ letterSpacing: '0.05em' }}
          >
            <span style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {current}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 2px' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{max}</span>
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
