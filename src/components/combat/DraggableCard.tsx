import { useState, useRef, useEffect, useCallback } from 'react';
import { CardInstance } from '../../types/card';
import { SwordIcon, ShieldIcon, PowerIcon } from './icons';
import { TargetingArrow } from './TargetingArrow';

interface DraggableCardProps {
  card: CardInstance;
  isSelected: boolean;
  isPlayable: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number, dragDistance: number) => void;
  rotation?: number;
  onHoverChange?: (isHovered: boolean) => void;
}

export function DraggableCard({
  card,
  isSelected,
  isPlayable,
  onSelect,
  onDragEnd,
  rotation = 0,
  onHoverChange,
}: DraggableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [cardCenter, setCardCenter] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const typeConfig = {
    ATTACK: {
      frameClass: 'card-frame-attack',
      bannerBg: 'linear-gradient(180deg, #5a2020 0%, #3a1010 100%)',
      accentColor: '#e04040',
      glowColor: 'rgba(184, 37, 37, 0.7)',
      orbGradient: 'radial-gradient(circle at 30% 30%, #ff6b6b 0%, #b82525 50%, #7a1818 100%)',
    },
    SKILL: {
      frameClass: 'card-frame-skill',
      bannerBg: 'linear-gradient(180deg, #204040 0%, #102a2a 100%)',
      accentColor: '#32c4c4',
      glowColor: 'rgba(30, 138, 138, 0.7)',
      orbGradient: 'radial-gradient(circle at 30% 30%, #5eeaea 0%, #1e8a8a 50%, #145858 100%)',
    },
    POWER: {
      frameClass: 'card-frame-power',
      bannerBg: 'linear-gradient(180deg, #4a3a15 0%, #2a2008 100%)',
      accentColor: '#f5b840',
      glowColor: 'rgba(201, 143, 40, 0.7)',
      orbGradient: 'radial-gradient(circle at 30% 30%, #ffd666 0%, #c98f28 50%, #6b4f18 100%)',
    },
  };

  const config = typeConfig[card.type];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPlayable) return;
    e.preventDefault();
    e.stopPropagation();

    // 카드 중심점 계산
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    setIsDragging(true);
    onSelect();
  };

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - cardCenter.x, 2) +
      Math.pow(e.clientY - cardCenter.y, 2)
    );

    setIsDragging(false);
    onDragEnd(e.clientX, e.clientY, dragDistance);
  }, [isDragging, cardCenter, onDragEnd]);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, handleMouseUp]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsHovered(false);
      onHoverChange?.(false);
    }
  };

  const getTransform = () => {
    if (isDragging) {
      return `rotate(0deg) scale(1.25) translateY(-30px)`;
    }
    if (isSelected) {
      return `rotate(0deg) scale(1.15) translateY(-20px)`;
    }
    if (isHovered && isPlayable) {
      return `rotate(0deg) translateY(-40px) scale(1.15)`;
    }
    return `rotate(${rotation}deg)`;
  };

  const getBoxShadow = () => {
    if (isDragging || isSelected) {
      return `0 0 50px ${config.glowColor}, 0 0 100px ${config.glowColor}, 0 30px 60px rgba(0,0,0,0.8)`;
    }
    if (isHovered && isPlayable) {
      return `0 0 40px ${config.glowColor}, 0 25px 50px rgba(0,0,0,0.7)`;
    }
    return '0 8px 25px rgba(0,0,0,0.5)';
  };

  const CardIcon = card.type === 'ATTACK' ? SwordIcon : card.type === 'SKILL' ? ShieldIcon : PowerIcon;

  return (
    <>
      {/* 화살표 타겟팅 */}
      <TargetingArrow
        startX={cardCenter.x}
        startY={cardCenter.y}
        isActive={isDragging}
        cardType={card.type}
      />

      <div
        ref={cardRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative select-none
          ${isPlayable ? 'cursor-pointer' : 'cursor-not-allowed'}
          ${isDragging ? 'cursor-crosshair' : ''}
          ${!isPlayable ? 'brightness-50 saturate-50' : ''}
        `}
        style={{
          width: '140px',
          height: '195px',
          transform: getTransform(),
          boxShadow: getBoxShadow(),
          zIndex: isDragging ? 1000 : isSelected ? 100 : isHovered ? 50 : undefined,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out, box-shadow 0.15s ease-out',
        }}
      >
        {/* 카드 외부 프레임 */}
        <div
          className={`absolute inset-0 rounded-xl ${config.frameClass}`}
          style={{
            background: 'linear-gradient(145deg, #2a2520 0%, #0a0805 100%)',
            border: `3px solid ${config.accentColor}`,
            borderRadius: '12px',
          }}
        >
          {/* 프레임 장식 - 코너 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 140 195">
            <path d="M8 4 L25 4 L25 8 L8 8 Z" fill={config.accentColor} opacity="0.6" />
            <path d="M4 8 L8 8 L8 25 L4 25 Z" fill={config.accentColor} opacity="0.6" />
            <path d="M115 4 L132 4 L132 8 L115 8 Z" fill={config.accentColor} opacity="0.6" />
            <path d="M132 8 L136 8 L136 25 L132 25 Z" fill={config.accentColor} opacity="0.6" />
            <path d="M8 187 L25 187 L25 191 L8 191 Z" fill={config.accentColor} opacity="0.6" />
            <path d="M4 170 L8 170 L8 187 L4 187 Z" fill={config.accentColor} opacity="0.6" />
            <path d="M115 187 L132 187 L132 191 L115 191 Z" fill={config.accentColor} opacity="0.6" />
            <path d="M132 170 L136 170 L136 187 L132 187 Z" fill={config.accentColor} opacity="0.6" />
          </svg>

          {/* 내부 프레임 */}
          <div
            className="absolute rounded-lg"
            style={{
              inset: '6px',
              background: 'linear-gradient(180deg, rgba(30,25,20,0.95) 0%, rgba(10,8,5,0.98) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>

        {/* 비용 오브 */}
        <div
          className="absolute z-30 flex items-center justify-center"
          style={{
            width: '38px',
            height: '38px',
            top: '-6px',
            left: '-6px',
            borderRadius: '50%',
            background: config.orbGradient,
            border: '3px solid var(--gold)',
            boxShadow: `0 0 15px ${config.glowColor}, inset 0 0 10px rgba(255,255,255,0.2)`,
          }}
        >
          <span
            className="font-title text-lg font-bold"
            style={{
              color: '#fff',
              textShadow: '0 0 10px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {card.cost}
          </span>
        </div>

        {/* 업그레이드 마크 */}
        {card.upgraded && (
          <div
            className="absolute z-30 flex items-center justify-center"
            style={{
              width: '24px',
              height: '24px',
              top: '2px',
              right: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
              border: '2px solid #86efac',
              boxShadow: '0 0 12px rgba(74, 222, 128, 0.6)',
            }}
          >
            <span className="text-white text-sm font-bold">+</span>
          </div>
        )}

        {/* 카드 이름 배너 */}
        <div
          className="absolute left-2 right-2 z-20"
          style={{
            top: '38px',
            height: '28px',
            background: config.bannerBg,
            borderTop: `2px solid ${config.accentColor}`,
            borderBottom: `2px solid ${config.accentColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-4"
            style={{
              background: config.accentColor,
              clipPath: 'polygon(100% 0, 100% 100%, 0 50%)',
            }}
          />
          <div
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-4"
            style={{
              background: config.accentColor,
              clipPath: 'polygon(0 0, 0 100%, 100% 50%)',
            }}
          />
          <span
            className="font-title text-xs tracking-wide truncate px-2"
            style={{ color: config.accentColor }}
          >
            {card.name}
          </span>
        </div>

        {/* 카드 아트 영역 */}
        <div
          className="absolute left-3 right-3 overflow-hidden"
          style={{
            top: '70px',
            height: '55px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.7) 100%)',
            border: `2px solid ${config.accentColor}`,
            borderRadius: '6px',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${config.accentColor}20 0%, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <CardIcon size={36} color={config.accentColor} />
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-1/2"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* 타입 라벨 */}
        <div className="absolute left-0 right-0 text-center" style={{ top: '128px' }}>
          <span
            className="font-display text-[9px] uppercase tracking-[0.2em]"
            style={{ color: config.accentColor, opacity: 0.7 }}
          >
            {card.type === 'ATTACK' ? 'Attack' : card.type === 'SKILL' ? 'Skill' : 'Power'}
          </span>
        </div>

        {/* 설명 영역 */}
        <div
          className="absolute left-2 right-2 bottom-2 rounded-md overflow-hidden"
          style={{
            height: '48px',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '6px 8px',
          }}
        >
          <p
            className="font-card text-[10px] text-gray-200 text-center leading-tight"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {card.description}
          </p>
        </div>

        {/* 드래그 중 글로우 오버레이 */}
        {isDragging && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${config.glowColor} 0%, transparent 70%)`,
              opacity: 0.5,
              animation: 'pulse 0.8s ease-in-out infinite',
            }}
          />
        )}

        {/* 플레이 불가 오버레이 */}
        {!isPlayable && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          />
        )}
      </div>
    </>
  );
}
