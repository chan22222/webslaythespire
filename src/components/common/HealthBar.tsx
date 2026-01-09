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

  const heights = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="w-full">
      {/* 체력바 컨테이너 */}
      <div
        className={`relative ${heights[size]} health-bar-container`}
      >
        {/* HP 바 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

        {/* HP 바 */}
        <div
          className={`absolute inset-y-0 left-0 health-bar-fill ${isLowHealth ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          {/* 광택 효과 */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-1/2" />
        </div>

        {/* 방어도 바 (HP 바 위에 겹쳐서 표시) */}
        {block > 0 && (
          <div
            className="absolute inset-y-0 left-0 block-bar-fill opacity-80"
            style={{ width: `${Math.min(100, (block / max) * 100)}%` }}
          >
            {/* 광택 효과 */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2" />
          </div>
        )}

        {/* 눈금 표시 */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-black/20 last:border-r-0" />
          ))}
        </div>

        {/* 숫자 표시 */}
        {showNumbers && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${textSizes[size]} font-title font-bold text-white`}
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)' }}
          >
            <span style={{ color: isLowHealth ? 'var(--hp-light)' : '#fff' }}>
              {current}
            </span>
            <span className="opacity-60 mx-0.5">/</span>
            <span className="opacity-80">{max}</span>
            {block > 0 && (
              <span className="ml-1.5 text-[var(--block-light)]">
                (+{block})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
