import { useState } from 'react';

interface EnergyOrbProps {
  current: number;
  max: number;
}

export function EnergyOrb({ current, max }: EnergyOrbProps) {
  const hasEnergy = current > 0;
  const fillPercent = max > 0 ? (current / max) * 100 : 0;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      style={{ width: '225px', height: '75px' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* 툴팁 */}
      {showTooltip && (
        <div
          className="absolute z-[9999] px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none"
          style={{
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '12px',
            background: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid var(--gold)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div className="font-title text-sm mb-1 text-[var(--gold-light)]">
            에너지
          </div>
          <div className="font-card text-xs text-gray-300">
            카드를 사용하려면 에너지가 필요합니다.
            <br />
            매 턴 {max} 에너지를 얻습니다.
          </div>
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid var(--gold)',
            }}
          />
        </div>
      )}

      {/* 글로우 레이어 (애니메이션) */}
      {hasEnergy && (
        <img
          src="/energy_bar.png"
          alt="Energy Glow"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 15px rgba(255, 150, 50, 0.8))',
            animation: 'energy-glow 2s ease-in-out infinite',
            opacity: 0.8,
          }}
        />
      )}

      {/* 프레임 배경 (활성/비활성) */}
      <img
        src={hasEnergy ? '/energy_bar.png' : '/energy_empty.png'}
        alt="Energy Frame"
        className="absolute inset-0 w-full h-full"
        style={{
          imageRendering: 'pixelated',
        }}
      />

      {/* 에너지 채움 바 - 실제 바 영역에 맞게 클리핑 */}
      {/* 원본 180px 기준: 좌 21px, 우 81px 여백, 바영역 78px → 1.25배: 좌 26px, 바영역 97.5px */}
      <div
        className="absolute overflow-hidden transition-all duration-300 ease-out"
        style={{
          left: '26px',
          top: '0',
          height: '100%',
          width: `${(fillPercent / 100) * 97.5}px`,
        }}
      >
        <img
          src="/energy.png"
          alt="Energy Fill"
          className="absolute h-full"
          style={{
            imageRendering: 'pixelated',
            width: '225px',
            maxWidth: 'none',
            left: '-26px',
          }}
        />
      </div>

      {/* 에너지 수치 텍스트 */}
      <div
        className="absolute inset-0 flex items-center justify-end"
        style={{ paddingRight: '20px', paddingTop: '1px' }}
      >
        <span
          className="font-bold"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '13px',
            color: hasEnergy ? '#fff' : '#666',
            textShadow: hasEnergy
              ? '0 0 10px rgba(255, 200, 112, 0.8), 0 2px 3px rgba(0,0,0,0.9)'
              : '0 1px 2px rgba(0,0,0,0.5)',
            letterSpacing: '2px',
          }}
        >
          {current}/{max}
        </span>
      </div>

      {/* 스타일 정의 */}
      <style>{`
        @keyframes energy-glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
