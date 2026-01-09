import { HeartIcon } from '../combat/icons';

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
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-9',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="w-full relative">
      {/* 체력바 외부 프레임 */}
      <div
        className={`relative ${heights[size]} rounded-md overflow-hidden`}
        style={{
          background: 'linear-gradient(180deg, #1a0808 0%, #0a0404 100%)',
          border: '2px solid #4a2020',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        {/* 배경 그라데이션 */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />

        {/* HP 바 */}
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-300 ${isCritical ? 'animate-pulse' : ''}`}
          style={{
            width: `${percentage}%`,
            background: isLowHealth
              ? 'linear-gradient(180deg, #ff5555 0%, #cc3333 30%, #aa2222 70%, #881818 100%)'
              : 'linear-gradient(180deg, #ff7070 0%, #e04545 30%, #b32828 70%, #8a1a1a 100%)',
            boxShadow: isLowHealth
              ? '0 0 15px rgba(255, 80, 80, 0.6), inset 0 0 10px rgba(255,255,255,0.2)'
              : '0 0 10px rgba(180, 40, 40, 0.5), inset 0 0 10px rgba(255,255,255,0.15)',
          }}
        >
          {/* 광택 효과 */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 30%, transparent 50%)',
            }}
          />

          {/* 하이라이트 라인 */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
            }}
          />
        </div>

        {/* 눈금 표시 */}
        <div className="absolute inset-0 flex pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r last:border-r-0"
              style={{ borderColor: 'rgba(0,0,0,0.3)' }}
            />
          ))}
        </div>

        {/* 숫자 표시 */}
        {showNumbers && (
          <div className={`absolute inset-0 flex items-center justify-center gap-1 ${textSizes[size]} font-title font-bold`}>
            {/* 하트 아이콘 */}
            <HeartIcon
              size={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
              color={isLowHealth ? '#ff6b6b' : '#ff8888'}
            />
            <span
              style={{
                color: isCritical ? '#ff6b6b' : isLowHealth ? '#ffaaaa' : '#fff',
                textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)',
              }}
            >
              {current}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{max}</span>
          </div>
        )}

        {/* 위험 표시 오버레이 */}
        {isCritical && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(255,0,0,0.2) 0%, transparent 50%, rgba(255,0,0,0.2) 100%)',
              animation: 'pulse 0.5s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* 블록 표시 (HP 바 아래) */}
      {block > 0 && (
        <div
          className="absolute -right-2 -top-2 flex items-center justify-center"
          style={{
            width: size === 'sm' ? '24px' : size === 'md' ? '28px' : '32px',
            height: size === 'sm' ? '24px' : size === 'md' ? '28px' : '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--block-light) 0%, var(--block-dark) 100%)',
            border: '2px solid var(--block-bright)',
            boxShadow: '0 0 12px rgba(40, 102, 168, 0.6)',
          }}
        >
          <span className={`font-title font-bold text-white ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            {block}
          </span>
        </div>
      )}
    </div>
  );
}
