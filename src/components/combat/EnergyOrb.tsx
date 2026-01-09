interface EnergyOrbProps {
  current: number;
  max: number;
}

export function EnergyOrb({ current, max }: EnergyOrbProps) {
  const hasEnergy = current > 0;

  return (
    <div className="relative w-20 h-20">
      {/* 외부 글로우 */}
      {hasEnergy && (
        <div
          className="absolute -inset-4 rounded-full animate-energy"
          style={{
            background: 'radial-gradient(circle, var(--energy-glow) 0%, transparent 60%)',
          }}
        />
      )}

      {/* 외부 장식 링 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg,
            var(--gold-deep), var(--gold-dark), var(--gold),
            var(--gold-dark), var(--gold-deep), var(--gold-dark),
            var(--gold), var(--gold-dark), var(--gold-deep))`,
          boxShadow: hasEnergy
            ? '0 0 20px var(--gold-glow)'
            : 'none',
        }}
      />

      {/* 내부 어두운 배경 */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '4px',
          background: 'var(--bg-darkest)',
        }}
      />

      {/* 메인 에너지 오브 */}
      <div
        className={`
          absolute rounded-full flex items-center justify-center
          ${hasEnergy ? 'energy-orb' : 'energy-orb-depleted'}
        `}
        style={{
          inset: '6px',
        }}
      >
        {/* 하이라이트 */}
        {hasEnergy && (
          <div
            className="absolute top-2 left-3 w-3 h-3 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
            }}
          />
        )}

        {/* 에너지 수치 */}
        <span
          className="font-title text-2xl font-bold relative z-10"
          style={{
            color: hasEnergy ? '#fff' : '#555',
            textShadow: hasEnergy
              ? '0 0 10px var(--energy-light), 0 2px 4px rgba(0,0,0,0.5)'
              : 'none',
          }}
        >
          {current}
        </span>
      </div>

      {/* 최대 에너지 표시 */}
      <div
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full"
        style={{
          background: 'var(--bg-darkest)',
          border: '1px solid var(--gold-dark)',
        }}
      >
        <span className="font-title text-xs text-[var(--gold)]">/{max}</span>
      </div>
    </div>
  );
}
