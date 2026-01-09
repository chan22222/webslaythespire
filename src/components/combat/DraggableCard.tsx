import { useState, useRef, useEffect, useCallback } from 'react';
import { CardInstance } from '../../types/card';

interface DraggableCardProps {
  card: CardInstance;
  isSelected: boolean;
  isPlayable: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number, dragDistance: number) => void;
  rotation?: number;
}

export function DraggableCard({
  card,
  isSelected,
  isPlayable,
  onSelect,
  onDragEnd,
  rotation = 0,
}: DraggableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const typeConfig = {
    ATTACK: {
      borderColor: 'var(--attack)',
      bgGradient: 'linear-gradient(145deg, #3a1515 0%, #1a0808 100%)',
      glowColor: 'var(--attack-glow)',
      lightColor: 'var(--attack-light)',
      icon: '⚔️',
    },
    SKILL: {
      borderColor: 'var(--skill)',
      bgGradient: 'linear-gradient(145deg, #153535 0%, #081a1a 100%)',
      glowColor: 'var(--skill-glow)',
      lightColor: 'var(--skill-light)',
      icon: '🛡️',
    },
    POWER: {
      borderColor: 'var(--power)',
      bgGradient: 'linear-gradient(145deg, #352a15 0%, #1a1508 100%)',
      glowColor: 'var(--power-glow)',
      lightColor: 'var(--power-light)',
      icon: '✨',
    },
  };

  const config = typeConfig[card.type];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPlayable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setDragPos({ x: 0, y: 0 });
    onSelect();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setDragPos({
      x: e.clientX - startPosRef.current.x,
      y: e.clientY - startPosRef.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - startPosRef.current.x, 2) +
      Math.pow(e.clientY - startPosRef.current.y, 2)
    );
    setIsDragging(false);
    setDragPos({ x: 0, y: 0 });
    onDragEnd(e.clientX, e.clientY, dragDistance);
  }, [isDragging, onDragEnd]);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getTransform = () => {
    if (isDragging) {
      return `translate(${dragPos.x}px, ${dragPos.y}px) rotate(0deg) scale(1.15)`;
    }
    if (isSelected) {
      return `rotate(0deg) scale(1.12)`;
    }
    if (isHovered && isPlayable) {
      return `rotate(${rotation}deg) translateY(-15px) scale(1.05)`;
    }
    return `rotate(${rotation}deg)`;
  };

  const getBoxShadow = () => {
    if (isDragging || isSelected) {
      return `0 0 35px ${config.glowColor}, 0 0 70px ${config.glowColor}, 0 20px 50px rgba(0,0,0,0.6)`;
    }
    if (isHovered && isPlayable) {
      return `0 0 25px ${config.glowColor}, 0 15px 35px rgba(0,0,0,0.5)`;
    }
    return '0 6px 20px rgba(0,0,0,0.4)';
  };

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-32 h-48 rounded-xl overflow-hidden select-none
        ${isPlayable ? 'cursor-grab' : 'cursor-not-allowed'}
        ${isDragging ? 'cursor-grabbing' : ''}
        ${!isPlayable ? 'opacity-50 grayscale' : ''}
      `}
      style={{
        background: config.bgGradient,
        border: `3px solid ${config.borderColor}`,
        transform: getTransform(),
        boxShadow: getBoxShadow(),
        zIndex: isDragging ? 1000 : isSelected ? 100 : undefined,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
      }}
    >
      {/* 내부 프레임 */}
      <div className="absolute inset-1 rounded-lg border border-white/10 pointer-events-none" />

      {/* 비용 오브 */}
      <div
        className="absolute -top-1 -left-1 w-9 h-9 rounded-full flex items-center justify-center z-20"
        style={{
          background: 'radial-gradient(circle at 35% 35%, var(--energy-bright) 0%, var(--energy) 50%, var(--energy-dark) 100%)',
          border: '2px solid var(--gold)',
          boxShadow: '0 0 12px var(--energy-glow), 0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <span className="font-title text-base font-bold text-white drop-shadow-lg">{card.cost}</span>
      </div>

      {/* 업그레이드 마크 */}
      {card.upgraded && (
        <div
          className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center z-20"
          style={{
            background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
            boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)',
          }}
        >
          <span className="text-white text-xs font-bold">+</span>
        </div>
      )}

      {/* 카드 이름 */}
      <div
        className="absolute top-9 left-0 right-0 py-1.5 px-2 z-10"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.85) 15%, rgba(0,0,0,0.85) 85%, transparent 100%)',
        }}
      >
        <span
          className="font-title text-xs text-center block tracking-wide truncate"
          style={{ color: config.lightColor }}
        >
          {card.name}
        </span>
      </div>

      {/* 카드 아트 */}
      <div
        className="absolute top-16 left-2 right-2 h-14 rounded-lg overflow-hidden flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
          border: `1px solid ${config.borderColor}`,
        }}
      >
        <span className="text-3xl drop-shadow-lg">{config.icon}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* 카드 타입 라벨 */}
      <div className="absolute bottom-14 left-0 right-0 text-center">
        <span
          className="font-card text-[10px] uppercase tracking-widest opacity-50"
          style={{ color: config.lightColor }}
        >
          {card.type}
        </span>
      </div>

      {/* 설명 영역 */}
      <div
        className="absolute bottom-1.5 left-1.5 right-1.5 rounded-lg p-1.5"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.85) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p className="font-card text-[10px] text-gray-200 text-center leading-tight line-clamp-2">
          {card.description}
        </p>
      </div>

      {/* 선택/드래그 글로우 오버레이 */}
      {(isSelected || isDragging) && (
        <div
          className="absolute inset-0 pointer-events-none animate-pulse-glow"
          style={{
            background: `radial-gradient(ellipse at center, ${config.glowColor} 0%, transparent 70%)`,
            opacity: 0.4,
          }}
        />
      )}
    </div>
  );
}
