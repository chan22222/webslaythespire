import { useState, useEffect } from 'react';
import { MapNode as MapNodeType } from '../../types/map';

interface MapNodeProps {
  node: MapNodeType;
  isAvailable: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

// 노드 타입별 설정 - 원본 비율 유지
const nodeConfig = {
  ENEMY: { size: 52, label: '적', description: '일반 적과 전투', icon: '/sprites/icon/enemy.png' },
  ELITE: { size: 60, label: '정예', description: '강력한 정예 적과 전투', icon: '/sprites/icon/enemy_elite.png' },
  BOSS: { size: 80, label: '보스', description: '이 층의 보스와 대결', icon: '/sprites/icon/enemy_boss.png' },
  REST: { size: 52, label: '휴식', description: 'HP를 회복하거나 카드를 강화', icon: '/sprites/icon/realx.png' },
  SHOP: { size: 52, label: '상점', description: '카드와 아이템을 구매', icon: '/sprites/icon/shop.png' },
  EVENT: { size: 52, label: '이벤트', description: '무작위 이벤트 발생', icon: '/sprites/icon/gamble.png' },
  TREASURE: { size: 52, label: '보물', description: '유물 획득', icon: '/sprites/icon/treasure.png' },
  NEXT_FLOOR: { size: 60, label: '다음 층', description: '다음 층으로 이동', icon: '/sprites/icon/question.png' },
};

export function MapNode({ node, isAvailable, isCurrent, onClick }: MapNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [nextFloorPhase, setNextFloorPhase] = useState<'lock' | 'shake' | 'reveal'>('lock');
  const config = nodeConfig[node.type] || nodeConfig.ENEMY;

  // NEXT_FLOOR 노드 애니메이션
  useEffect(() => {
    if (node.type !== 'NEXT_FLOOR') return;

    // lock → shake → reveal 순서로 애니메이션
    const shakeTimer = setTimeout(() => setNextFloorPhase('shake'), 500);
    const revealTimer = setTimeout(() => setNextFloorPhase('reveal'), 1200);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(revealTimer);
    };
  }, [node.type]);

  // NEXT_FLOOR 노드의 현재 아이콘
  const getCurrentIcon = () => {
    if (node.type !== 'NEXT_FLOOR') return config.icon;
    if (nextFloorPhase === 'lock' || nextFloorPhase === 'shake') {
      return '/sprites/icon/lock.png';
    }
    return '/sprites/icon/question.png';
  };
  const halfSize = config.size / 2;
  const isDisabled = !isAvailable && !node.visited;

  const getFilter = () => {
    if (node.visited) return 'grayscale(80%) brightness(0.6)';
    if (isDisabled) return 'brightness(0.55) saturate(0.7)';
    if (isAvailable) return 'drop-shadow(0 0 10px rgba(212, 168, 75, 0.9))';
    return 'brightness(0.65)';
  };

  return (
    <div
      onClick={isAvailable ? onClick : undefined}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="absolute"
      style={{
        left: node.x - halfSize,
        top: node.y - halfSize,
        width: config.size,
        height: config.size,
      }}
    >
      {/* 현재 위치 펄스 */}
      {isCurrent && (
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: config.size * 1.2,
            height: config.size * 1.2,
            transform: 'translate(-50%, -50%)',
            border: '2px solid #ef4444',
            borderRadius: '6px',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
            animation: 'currentPulse 1.2s ease-in-out infinite',
          }}
        />
      )}

      {/* 이용 가능 글로우 */}
      {isAvailable && !node.visited && (
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '50%',
            width: config.size * 2,
            height: config.size * 2,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(212, 168, 75, 0.5) 0%, transparent 70%)',
            animation: 'nodeGlow 2s ease-in-out infinite',
          }}
        />
      )}

      {/* 아이콘 이미지 - 원본 비율 유지 */}
      <div
        className={`
          absolute inset-0
          flex items-center justify-center
          transition-all duration-150
          ${isAvailable && !node.visited ? 'cursor-pointer hover:scale-110' : ''}
          ${node.type === 'NEXT_FLOOR' && nextFloorPhase === 'shake' ? 'animate-shake' : ''}
        `}
      >
        <img
          src={getCurrentIcon()}
          alt={config.label}
          style={{
            maxWidth: config.size,
            maxHeight: config.size,
            width: 'auto',
            height: 'auto',
            imageRendering: 'pixelated',
            filter: getFilter(),
            transition: 'all 0.15s ease',
            animation: node.type === 'NEXT_FLOOR' && nextFloorPhase === 'reveal' ? 'popIn 0.3s ease-out' : undefined,
          }}
        />

        {/* 방문 완료 체크 오버레이 */}
        {node.visited && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              fontSize: config.size * 0.5,
              color: '#4ade80',
              fontFamily: '"Press Start 2P", monospace',
              textShadow: '0 0 8px rgba(74, 222, 128, 0.8), 2px 2px 0 #000',
            }}
          >
            ✓
          </div>
        )}
      </div>

      {/* 툴팁 */}
      {showTooltip && (
        <div
          className="absolute z-50 pointer-events-none whitespace-nowrap"
          style={{
            left: '50%',
            bottom: config.size + 16,
            transform: 'translateX(-50%)',
            background: 'rgba(10, 8, 5, 0.95)',
            padding: '8px 14px',
            border: '2px solid var(--gold-dark)',
            boxShadow: '0 0 16px rgba(0,0,0,0.9), 0 0 6px var(--gold-glow)',
          }}
        >
          <div
            className="text-sm font-bold"
            style={{
              fontFamily: '"NeoDunggeunmo", cursive',
              color: 'var(--gold)',
            }}
          >
            {config.label}
          </div>
          <div
            className="text-xs mt-1"
            style={{
              fontFamily: '"NeoDunggeunmo", cursive',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            {config.description}
          </div>
          <div
            className="absolute left-1/2 -bottom-[8px]"
            style={{
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid var(--gold-dark)',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes nodeGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes currentPulse {
          0%, 100% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          10% { transform: translateX(-4px) rotate(-3deg); }
          20% { transform: translateX(4px) rotate(3deg); }
          30% { transform: translateX(-4px) rotate(-3deg); }
          40% { transform: translateX(4px) rotate(3deg); }
          50% { transform: translateX(-3px) rotate(-2deg); }
          60% { transform: translateX(3px) rotate(2deg); }
          70% { transform: translateX(-2px) rotate(-1deg); }
          80% { transform: translateX(2px) rotate(1deg); }
          90% { transform: translateX(-1px) rotate(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
