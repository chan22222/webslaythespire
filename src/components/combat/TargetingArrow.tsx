import { useEffect, useState, useCallback } from 'react';

interface TargetingArrowProps {
  startX: number;
  startY: number;
  isActive: boolean;
  cardType: 'ATTACK' | 'SKILL' | 'POWER';
}

export function TargetingArrow({ startX, startY, isActive, cardType }: TargetingArrowProps) {
  const [mousePos, setMousePos] = useState({ x: startX, y: startY });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (isActive) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isActive, handleMouseMove]);

  if (!isActive) return null;

  // 시작점과 끝점
  const dx = mousePos.x - startX;
  const dy = mousePos.y - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 최소 거리 체크
  if (distance < 30) return null;

  // 베지어 곡선을 위한 제어점 계산
  const midX = (startX + mousePos.x) / 2;
  const midY = Math.min(startY, mousePos.y) - distance * 0.3; // 위로 휘는 곡선

  // 색상 설정
  const colors = {
    ATTACK: { main: '#e04040', glow: 'rgba(224, 64, 64, 0.6)' },
    SKILL: { main: '#32c4c4', glow: 'rgba(50, 196, 196, 0.6)' },
    POWER: { main: '#f5b840', glow: 'rgba(245, 184, 64, 0.6)' },
  };

  const color = colors[cardType];

  // SVG 경로 생성
  const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${mousePos.x} ${mousePos.y}`;

  return (
    <div className="fixed inset-0 pointer-events-none z-[999]">
      <svg className="w-full h-full">
        <defs>
          {/* 글로우 필터 */}
          <filter id="arrowGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 화살표 마커 */}
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="10"
            refX="10"
            refY="5"
            orient="auto"
          >
            <polygon
              points="0 0, 12 5, 0 10, 3 5"
              fill={color.main}
            />
          </marker>

          {/* 그라데이션 */}
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.main} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color.main} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* 글로우 효과 */}
        <path
          d={pathD}
          fill="none"
          stroke={color.glow}
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#arrowGlow)"
        />

        {/* 메인 화살표 라인 */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#arrowGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
        />

        {/* 점선 효과 (애니메이션) */}
        <path
          d={pathD}
          fill="none"
          stroke={color.main}
          strokeWidth="2"
          strokeDasharray="8 8"
          strokeLinecap="round"
          style={{
            animation: 'dash 0.5s linear infinite',
          }}
        />
      </svg>

      {/* 타겟 원 */}
      <div
        className="absolute rounded-full"
        style={{
          left: mousePos.x - 25,
          top: mousePos.y - 25,
          width: 50,
          height: 50,
          border: `3px solid ${color.main}`,
          boxShadow: `0 0 20px ${color.glow}, inset 0 0 20px ${color.glow}`,
          animation: 'pulse 1s ease-in-out infinite',
        }}
      />

      {/* 크로스헤어 */}
      <div
        className="absolute"
        style={{
          left: mousePos.x - 2,
          top: mousePos.y - 15,
          width: 4,
          height: 30,
          background: color.main,
          boxShadow: `0 0 10px ${color.glow}`,
        }}
      />
      <div
        className="absolute"
        style={{
          left: mousePos.x - 15,
          top: mousePos.y - 2,
          width: 30,
          height: 4,
          background: color.main,
          boxShadow: `0 0 10px ${color.glow}`,
        }}
      />

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -16;
          }
        }
      `}</style>
    </div>
  );
}
