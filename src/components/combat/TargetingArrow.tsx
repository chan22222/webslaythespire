import { useEffect, useState, useCallback, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCombatStore } from '../../stores/combatStore';

interface TargetingArrowProps {
  startX: number;
  startY: number;
  isActive: boolean;
  cardType: 'ATTACK' | 'SHIELD' | 'GADGET' | 'EFFECT' | 'TERRAIN';
  needsTarget: boolean;
  initialEndX?: number;
  initialEndY?: number;
}

interface SnapTarget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// 모바일 감지
const isMobile = () => window.innerHeight < 500;

// 자석 효과 범위 (px) - 모바일에서 더 작게
const getSnapDistance = () => isMobile() ? 60 : 100;

export function TargetingArrow({ startX, startY, isActive, cardType, needsTarget, initialEndX, initialEndY }: TargetingArrowProps) {
  const [mousePos, setMousePos] = useState({ x: initialEndX ?? startX, y: initialEndY ?? startY });
  const [snappedTarget, setSnappedTarget] = useState<SnapTarget | null>(null);
  const targetsRef = useRef<SnapTarget[]>([]);
  const playerRef = useRef<SnapTarget | null>(null);
  const uniqueId = useId();
  const rafRef = useRef<number | null>(null);
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null);
  const setTargetedEnemyId = useCombatStore(state => state.setTargetedEnemyId);

  // 타겟 요소들의 위치를 업데이트
  const updateTargets = useCallback(() => {
    // 적 타겟
    const enemies = document.querySelectorAll('[data-enemy-id]');
    const targets: SnapTarget[] = [];

    enemies.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const id = el.getAttribute('data-enemy-id');
      if (id) {
        targets.push({
          id,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        });
      }
    });

    targetsRef.current = targets;

    // 플레이어 타겟
    const playerEl = document.querySelector('[data-player]');
    if (playerEl) {
      const rect = playerEl.getBoundingClientRect();
      playerRef.current = {
        id: 'player',
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
      };
    }
  }, []);

  // 가장 가까운 적 타겟 찾기
  const findClosestEnemy = useCallback((x: number, y: number): SnapTarget | null => {
    let closest: SnapTarget | null = null;
    let minDistance = getSnapDistance();

    for (const target of targetsRef.current) {
      const distance = Math.sqrt(
        Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = target;
      }
    }

    return closest;
  }, []);

  const processMove = useCallback(() => {
    if (!pendingPosRef.current) return;

    const { x: clientX, y: clientY } = pendingPosRef.current;
    updateTargets();

    if (needsTarget) {
      // 타겟 필요: 적에게 스냅
      const closest = findClosestEnemy(clientX, clientY);
      setSnappedTarget(closest);
      // 적 타겟팅 시 combatStore에 저장 (player가 아닌 경우만)
      setTargetedEnemyId(closest && closest.id !== 'player' ? closest.id : null);

      if (closest) {
        setMousePos({ x: closest.x, y: closest.y - 20 });
      } else {
        setMousePos({ x: clientX, y: clientY });
      }
    } else {
      // 논타겟 카드: 화면 상단 50% 이상일 때만 플레이어에 스냅
      const isInPlayArea = clientY < window.innerHeight * 0.5;

      if (isInPlayArea && playerRef.current) {
        setSnappedTarget(playerRef.current);
        setMousePos({ x: playerRef.current.x, y: playerRef.current.y - 30 });
      } else {
        setSnappedTarget(null);
        setMousePos({ x: clientX, y: clientY });
      }
      // 논타겟 카드는 적 타겟팅 없음
      setTargetedEnemyId(null);
    }

    pendingPosRef.current = null;
    rafRef.current = null;
  }, [updateTargets, findClosestEnemy, needsTarget, setTargetedEnemyId]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    pendingPosRef.current = { x: clientX, y: clientY };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(processMove);
    }
  }, [processMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [handleMove]);

  useEffect(() => {
    if (isActive) {
      updateTargets();
      // 초기 끝점이 주어지면 그 위치로, 아니면 시작점으로
      const initX = initialEndX ?? startX;
      const initY = initialEndY ?? startY;
      setMousePos({ x: initX, y: initY });
      setSnappedTarget(null);
      // 초기 위치에서 바로 스냅 체크
      if (initialEndX !== undefined && initialEndY !== undefined) {
        pendingPosRef.current = { x: initX, y: initY };
        requestAnimationFrame(() => {
          if (pendingPosRef.current) {
            const { x, y } = pendingPosRef.current;
            updateTargets();
            // processMove 로직 일부 실행
            if (needsTarget) {
              let closest: SnapTarget | null = null;
              let minDistance = getSnapDistance();
              for (const target of targetsRef.current) {
                const distance = Math.sqrt(Math.pow(x - target.x, 2) + Math.pow(y - target.y, 2));
                if (distance < minDistance) {
                  minDistance = distance;
                  closest = target;
                }
              }
              setSnappedTarget(closest);
              setTargetedEnemyId(closest && closest.id !== 'player' ? closest.id : null);
              if (closest) {
                setMousePos({ x: closest.x, y: closest.y - 20 });
              }
            }
            pendingPosRef.current = null;
          }
        });
      }
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        // 드래그 종료 시 타겟팅 초기화
        setTargetedEnemyId(null);
      };
    }
  }, [isActive, handleMouseMove, handleTouchMove, startX, startY, initialEndX, initialEndY, updateTargets, setTargetedEnemyId, needsTarget]);

  if (!isActive) return null;

  // 시작점이 유효하지 않으면 렌더링하지 않음 (0, 0은 초기값)
  if (startX === 0 && startY === 0) return null;

  // 시작점과 끝점
  const dx = mousePos.x - startX;
  const dy = mousePos.y - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 최소 거리 체크
  if (distance < 30) return null;

  // 베지어 곡선을 위한 제어점 계산
  const midX = (startX + mousePos.x) / 2;
  const midY = Math.min(startY, mousePos.y) - distance * 0.3;

  // 색상 설정
  const colors = {
    ATTACK: { main: '#e8a040', glow: 'rgba(232, 160, 64, 0.6)' },
    SHIELD: { main: '#40a8e8', glow: 'rgba(64, 168, 232, 0.6)' },
    GADGET: { main: '#40e8a0', glow: 'rgba(64, 232, 160, 0.6)' },
    EFFECT: { main: '#a040e8', glow: 'rgba(160, 64, 232, 0.6)' },
    TERRAIN: { main: '#8b6914', glow: 'rgba(139, 105, 20, 0.6)' },
  };

  const color = colors[cardType];

  // SVG 경로 생성
  const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${mousePos.x} ${mousePos.y}`;

  // 고유 ID 생성
  const glowId = `arrowGlow-${uniqueId}`;
  const arrowheadId = `arrowhead-${uniqueId}`;
  const gradientId = `arrowGradient-${uniqueId}`;

  const isSnapped = snappedTarget !== null;
  const mobile = isMobile();
  const targetSize = mobile ? (isSnapped ? 50 : 35) : (isSnapped ? 70 : 50);
  const crosshairSize = mobile ? (isSnapped ? 28 : 20) : (isSnapped ? 40 : 30);
  const strokeWidth = mobile ? 4 : 6;
  const strokeDash = mobile ? "12 10" : "16 14";

  const content = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99999,
      }}
    >
      <svg style={{ width: '100%', height: '100%', willChange: 'auto' }}>
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <marker
            id={arrowheadId}
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 8 3, 0 6, 2 3"
              fill={color.main}
            />
          </marker>

          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color.main} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color.main} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* 점선 화살표 */}
        <path
          d={pathD}
          fill="none"
          stroke={color.main}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          strokeLinecap="round"
          markerEnd={`url(#${arrowheadId})`}
          className="targeting-dash-anim"
        />
      </svg>

      {/* 타겟 원 */}
      <div
        style={{
          position: 'absolute',
          left: mousePos.x - targetSize / 2,
          top: mousePos.y - targetSize / 2,
          width: targetSize,
          height: targetSize,
          borderRadius: '50%',
          border: `${isSnapped ? 4 : 3}px solid ${color.main}`,
          boxShadow: isSnapped
            ? `0 0 30px ${color.main}, 0 0 60px ${color.glow}, inset 0 0 30px ${color.glow}`
            : `0 0 20px ${color.glow}, inset 0 0 20px ${color.glow}`,
          animation: 'pulse 1s ease-in-out infinite',
        }}
      />

      {/* 크로스헤어 */}
      <div
        style={{
          position: 'absolute',
          left: mousePos.x - 2,
          top: mousePos.y - crosshairSize / 2,
          width: 4,
          height: crosshairSize,
          background: color.main,
          boxShadow: `0 0 10px ${color.glow}`,
          opacity: 0.6,
          animation: 'pulse 1s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: mousePos.x - crosshairSize / 2,
          top: mousePos.y - 2,
          width: crosshairSize,
          height: 4,
          background: color.main,
          boxShadow: `0 0 10px ${color.glow}`,
          opacity: 0.6,
          animation: 'pulse 1s ease-in-out infinite',
        }}
      />

      {/* 스냅 표시 */}
      {isSnapped && (
        <div
          style={{
            position: 'absolute',
            left: mousePos.x,
            top: mousePos.y + 50,
            transform: 'translateX(-50%)',
            padding: '4px 12px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: `2px solid ${color.main}`,
            borderRadius: '6px',
            color: color.main,
            fontSize: '12px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            boxShadow: `0 0 15px ${color.glow}`,
          }}
        >
          {snappedTarget?.id === 'player' ? 'SELF' : 'LOCKED'}
        </div>
      )}

      <style>{`
        @keyframes targetingDash {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -30;
          }
        }
        .targeting-dash-anim {
          animation: targetingDash 0.5s linear infinite;
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}
