import { useState } from 'react';
import { LightningIcon } from './icons';

interface EnergyOrbProps {
  current: number;
  max: number;
}

export function EnergyOrb({ current, max }: EnergyOrbProps) {
  const hasEnergy = current > 0;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="relative"
      style={{ width: '90px', height: '90px' }}
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
      {/* 외부 글로우 - 에너지가 있을 때만 */}
      {hasEnergy && (
        <>
          <div
            className="absolute -inset-6 rounded-full animate-energy"
            style={{
              background: 'radial-gradient(circle, rgba(216, 104, 32, 0.6) 0%, transparent 60%)',
            }}
          />
          {/* 불꽃 파티클 효과 */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ffa850 0%, #d86820 100%)',
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 60}deg) translateY(-50px)`,
                  animation: `particle-float ${2 + i * 0.3}s ease-in-out infinite`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* 외부 장식 링 - 룬 패턴 */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 90 90">
        <defs>
          <linearGradient id="runeRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={hasEnergy ? 'var(--gold)' : '#444'} />
            <stop offset="50%" stopColor={hasEnergy ? 'var(--gold-dark)' : '#333'} />
            <stop offset="100%" stopColor={hasEnergy ? 'var(--gold-deep)' : '#222'} />
          </linearGradient>
          <filter id="runeGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 외부 링 */}
        <circle
          cx="45"
          cy="45"
          r="42"
          fill="none"
          stroke="url(#runeRingGradient)"
          strokeWidth="3"
          filter={hasEnergy ? 'url(#runeGlow)' : ''}
        />

        {/* 룬 마크 */}
        {hasEnergy && [...Array(8)].map((_, i) => (
          <circle
            key={i}
            cx={45 + 38 * Math.cos((i * Math.PI * 2) / 8 - Math.PI / 2)}
            cy={45 + 38 * Math.sin((i * Math.PI * 2) / 8 - Math.PI / 2)}
            r="3"
            fill="var(--gold)"
            opacity="0.8"
          />
        ))}

        {/* 내부 장식 링 */}
        <circle
          cx="45"
          cy="45"
          r="35"
          fill="none"
          stroke={hasEnergy ? 'var(--gold-dark)' : '#222'}
          strokeWidth="1.5"
          strokeDasharray="8 4"
        />
      </svg>

      {/* 내부 어두운 배경 */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '8px',
          background: 'radial-gradient(circle at 50% 50%, #1a1510 0%, #0a0805 100%)',
          border: '2px solid var(--gold-deep)',
        }}
      />

      {/* 메인 에너지 오브 */}
      <div
        className="absolute rounded-full flex items-center justify-center overflow-hidden"
        style={{
          inset: '12px',
          background: hasEnergy
            ? `
              radial-gradient(circle at 30% 25%,
                #ffc870 0%,
                #f0a040 15%,
                #d86820 35%,
                #a84010 60%,
                #6a2808 85%,
                #3a1404 100%)
            `
            : `
              radial-gradient(circle at 30% 25%,
                #555 0%,
                #3a3a3a 40%,
                #252525 70%,
                #151515 100%)
            `,
          boxShadow: hasEnergy
            ? `
              0 0 40px rgba(216, 104, 32, 0.8),
              0 0 80px rgba(216, 104, 32, 0.4),
              inset 0 0 25px rgba(255, 200, 112, 0.4),
              inset -5px -5px 20px rgba(0, 0, 0, 0.5)
            `
            : 'inset -4px -4px 15px rgba(0,0,0,0.6)',
        }}
      >
        {/* 에너지 흐름 효과 */}
        {hasEnergy && (
          <>
            <div
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,200,112,0.3) 25%, transparent 50%)',
                animation: 'spin 4s linear infinite',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'conic-gradient(from 180deg, transparent 0%, rgba(255,150,80,0.2) 25%, transparent 50%)',
                animation: 'spin 3s linear infinite reverse',
              }}
            />
          </>
        )}

        {/* 하이라이트 */}
        {hasEnergy && (
          <div
            className="absolute rounded-full"
            style={{
              top: '8px',
              left: '12px',
              width: '20px',
              height: '15px',
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)',
            }}
          />
        )}

        {/* 에너지 아이콘 (배경) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <LightningIcon size={30} color={hasEnergy ? '#fff' : '#333'} />
        </div>

        {/* 에너지 수치 */}
        <span
          className="font-title text-2xl font-bold relative z-10"
          style={{
            color: hasEnergy ? '#fff' : '#555',
            textShadow: hasEnergy
              ? '0 0 15px rgba(255, 200, 112, 0.8), 0 0 30px rgba(216, 104, 32, 0.6), 0 2px 4px rgba(0,0,0,0.8)'
              : 'none',
          }}
        >
          {current}
        </span>
      </div>

      {/* 최대 에너지 표시 */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full"
        style={{
          background: 'linear-gradient(180deg, rgba(30,25,20,0.95) 0%, rgba(10,8,5,0.98) 100%)',
          border: '2px solid var(--gold-dark)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}
      >
        <span
          className="font-title text-sm"
          style={{
            color: hasEnergy ? 'var(--gold-light)' : '#555',
          }}
        >
          /{max}
        </span>
      </div>

      {/* 스타일 정의 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes particle-float {
          0%, 100% {
            opacity: 0.7;
            transform: rotate(var(--rotation)) translateY(-50px) scale(1);
          }
          50% {
            opacity: 0.3;
            transform: rotate(var(--rotation)) translateY(-55px) scale(0.6);
          }
        }
      `}</style>
    </div>
  );
}
