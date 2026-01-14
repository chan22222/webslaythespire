import { useState, useRef, useEffect, useCallback } from 'react';
import { CardInstance } from '../../types/card';
import { TargetingArrow } from './TargetingArrow';
import { useCombatStore } from '../../stores/combatStore';
import { useGameStore } from '../../stores/gameStore';

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
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
  });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const typeConfig = {
    ATTACK: {
      cardImage: '/cards/attackcard.png',
      accentColor: '#e8a040',
      glowColor: 'rgba(232, 160, 64, 0.7)',
      textColor: '#fff',
      typeName: 'Attack',
    },
    SHIELD: {
      cardImage: '/cards/shieldcard.png',
      accentColor: '#40a8e8',
      glowColor: 'rgba(64, 168, 232, 0.7)',
      textColor: '#fff',
      typeName: 'Shield',
    },
    GADGET: {
      cardImage: '/cards/gadgetcard.png',
      accentColor: '#40e8a0',
      glowColor: 'rgba(64, 232, 160, 0.7)',
      textColor: '#fff',
      typeName: 'Gadget',
    },
    EFFECT: {
      cardImage: '/cards/effectcard.png',
      accentColor: '#a040e8',
      glowColor: 'rgba(160, 64, 232, 0.7)',
      textColor: '#fff',
      typeName: 'Effect',
    },
    TERRAIN: {
      cardImage: '/cards/terraincard.png',
      accentColor: '#8b6914',
      glowColor: 'rgba(139, 105, 20, 0.7)',
      textColor: '#fff',
      typeName: 'Terrain',
    },
  };

  const rarityConfig = {
    BASIC: { name: 'Basic', color: '#a0a0a0' },
    COMMON: { name: 'Common', color: '#a0a0a0' },
    UNCOMMON: { name: 'Uncommon', color: '#4a9eff' },
    RARE: { name: 'Rare', color: '#c084fc' },
    UNIQUE: { name: 'Unique', color: '#e879f9' },
  };

  const config = typeConfig[card.type];

  // 전투 중인 경우 플레이어 상태 가져오기
  const playerStatuses = useCombatStore(state => state.playerStatuses);
  const usedCardTypes = useCombatStore(state => state.usedCardTypes);

  // 데미지 수정치 계산
  const calculateModifiedDamage = (baseDamage: number) => {
    let damage = baseDamage;

    // 힘 적용
    const strength = playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
    damage += strength;

    // 약화 적용 (25% 감소)
    const weak = playerStatuses.find(s => s.type === 'WEAK');
    if (weak && weak.stacks > 0) {
      damage = Math.round(damage * 0.75);
    }

    return Math.max(0, damage);
  };

  // 데미지가 수정되었는지 확인하고 설명 업데이트
  const getModifiedDescription = () => {
    let description = card.description;

    if (!card.effects || card.effects.length === 0) {
      return description;
    }

    // 종언의 일격: 사용한 카드 종류당 피해 표시 (자기 자신 제외)
    if (card.id === 'final_strike') {
      const uniqueCount = usedCardTypes.filter(id => id !== 'final_strike').length;
      const damagePerType = card.upgraded ? 6 : 4;
      const totalDamage = damagePerType * uniqueCount;
      description = description.replace(
        /종류당 (\d+) 피해를/,
        `종류당 $1 (${totalDamage}) 피해를`
      );
    }

    // 사선에서: 잃은 HP 기반 피해 표시
    const lostHpEffect = card.effects.find(e => e.type === 'DAMAGE_PER_LOST_HP');
    if (lostHpEffect) {
      const gameState = useGameStore.getState();
      const lostHp = gameState.player.maxHp - gameState.player.currentHp;
      const ratio = lostHpEffect.ratio || 1;
      const baseDmg = Math.floor((lostHp / ratio) * lostHpEffect.value);
      const strength = playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
      const finalDmg = Math.max(0, baseDmg + strength);

      // "잃은 HP X당 Y의 피해" 형식에서 실제 피해 표시
      description = description.replace(
        /피해를 줍니다/,
        `피해(${finalDmg})를 줍니다`
      );
    }

    const strength = playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
    const weak = playerStatuses.find(s => s.type === 'WEAK');
    const hasModifier = strength !== 0 || (weak && weak.stacks > 0);

    if (!hasModifier) {
      return description;
    }

    for (const effect of card.effects) {
      if (effect.type === 'DAMAGE') {
        const baseDamage = effect.value;
        const modifiedDamage = calculateModifiedDamage(baseDamage);

        if (baseDamage !== modifiedDamage) {
          const pattern = new RegExp(`${baseDamage} 피해`, 'g');
          if (pattern.test(description)) {
            // "실제 (원래) 피해" 형식으로 표시
            description = description.replace(pattern, `${modifiedDamage} (${baseDamage}) 피해`);
          }
        }
      }
    }

    return description;
  };

  const modifiedDescription = getModifiedDescription();

  // 데미지 색상 (증가: 초록, 감소: 빨강)
  const getDamageColor = () => {
    if (!card.effects) return null;

    for (const effect of card.effects) {
      if (effect.type === 'DAMAGE') {
        const baseDamage = effect.value;
        const modifiedDamage = calculateModifiedDamage(baseDamage);

        if (modifiedDamage > baseDamage) return '#4ade80';
        if (modifiedDamage < baseDamage) return '#ff6b6b';
      }
    }
    return null;
  };

  const damageColor = getDamageColor();

  const startDrag = () => {
    if (!isPlayable) return;

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDragState({
        isDragging: true,
        startX: rect.left + rect.width / 2,
        startY: rect.top + rect.height / 2,
      });
    }

    onSelect();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    startDrag();
  };

  const endDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragState.isDragging) return;

    const dragDistance = Math.sqrt(
      Math.pow(clientX - dragState.startX, 2) +
      Math.pow(clientY - dragState.startY, 2)
    );

    setDragState(prev => ({ ...prev, isDragging: false }));
    setIsHovered(false);
    onHoverChange?.(false);
    onDragEnd(clientX, clientY, dragDistance);
  }, [dragState, onDragEnd, onHoverChange]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    endDrag(e.clientX, e.clientY);
  }, [endDrag]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    endDrag(touch.clientX, touch.clientY);
  }, [endDrag]);

  useEffect(() => {
    if (!dragState.isDragging) return;
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragState.isDragging, handleMouseUp, handleTouchEnd]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    if (!dragState.isDragging) {
      setIsHovered(false);
      onHoverChange?.(false);
    }
  };

  const getTransform = () => {
    if (dragState.isDragging) {
      return `rotate(0deg) scale(1.25) translateY(-30px)`;
    }
    if (isSelected) {
      return `rotate(0deg) scale(1.2) translateY(-20px)`;
    }
    if (isHovered && isPlayable) {
      return `rotate(0deg) translateY(-50px) scale(1.25)`;
    }
    return `rotate(${rotation}deg)`;
  };

  const getDropShadow = () => {
    if (dragState.isDragging || isSelected) {
      return `drop-shadow(0 0 15px ${config.glowColor}) drop-shadow(0 0 30px ${config.glowColor})`;
    }
    if (isHovered && isPlayable) {
      return `drop-shadow(0 0 12px ${config.glowColor}) drop-shadow(0 0 25px ${config.glowColor})`;
    }
    return 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))';
  };

  // 타겟이 필요한 카드인지 확인
  const needsTarget = card.effects.some(e =>
    (e.type === 'DAMAGE' && e.target === 'SINGLE') ||
    (e.type === 'APPLY_STATUS' && e.target === 'SINGLE') ||
    (e.type === 'DAMAGE_PER_LOST_HP' && e.target === 'SINGLE') ||
    (e.type === 'HALVE_ENEMY_HP' && e.target === 'SINGLE')
  );

  return (
    <>
      {/* 화살표 타겟팅 */}
      <TargetingArrow
        key={dragState.isDragging ? card.instanceId : 'inactive'}
        startX={dragState.startX}
        startY={dragState.startY}
        isActive={dragState.isDragging}
        cardType={card.type}
        needsTarget={needsTarget}
      />

      <div
        ref={cardRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative select-none
          ${isPlayable ? 'cursor-pointer' : 'cursor-not-allowed'}
          ${dragState.isDragging ? 'cursor-crosshair' : ''}
          ${!isPlayable ? 'brightness-50 saturate-50' : ''}
        `}
        style={{
          width: '140px',
          height: '195px',
          transform: getTransform(),
          filter: getDropShadow(),
          zIndex: dragState.isDragging ? 1000 : isSelected ? 100 : isHovered ? 50 : undefined,
          transition: dragState.isDragging ? 'none' : 'transform 0.15s ease-out, filter 0.15s ease-out',
        }}
      >
        {/* 카드 아트 이미지 (프레임 뒤) */}
        {card.image && (
          <img
            src={card.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-lg pointer-events-none"
            style={{ zIndex: 0 }}
            draggable={false}
          />
        )}

        {/* 카드 프레임 이미지 배경 */}
        <img
          src={config.cardImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-lg pointer-events-none"
          style={{ zIndex: 1 }}
          draggable={false}
        />

        {/* 카드 이름 - 더 위로, 더 크게 */}
        <div
          className="absolute left-2 right-2 z-20 text-center"
          style={{ top: '14px' }}
        >
          <span
            className="font-card"
            style={{
              fontSize: '9px',
              color: config.textColor,
              textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
              fontWeight: 600,
            }}
          >
            {card.name}
          </span>
        </div>

        {/* 카드 타입 - 중앙 하단 (설명 위) */}
        <div
          className="absolute left-2 right-2 z-30 text-center"
          style={{ bottom: '55px' }}
        >
          <span
            className="font-card"
            style={{
              fontSize: '9px',
              color: config.accentColor,
              textShadow: '1px 1px 0 #000',
            }}
          >
            {config.typeName}
            <span style={{ color: rarityConfig[card.rarity].color }}>
              {' '}- {rarityConfig[card.rarity].name}
            </span>
          </span>
        </div>

        {/* 카드 비용 - 좌상단 */}
        <div
          className="absolute z-30 flex items-center justify-center"
          style={{
            width: '28px',
            height: '28px',
            top: '7px',
            left: '9px',
          }}
        >
          <span
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '14px',
              color: '#fff',
              textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
              width: '100%',
              textAlign: 'center',
              display: 'block',
            }}
          >
            {card.cost}
          </span>
        </div>

        {/* 업그레이드 마크 - 우측 상단 */}
        {card.upgraded && (
          <div
            className="absolute z-30 flex items-center justify-center"
            style={{
              width: '20px',
              height: '20px',
              top: '5px',
              right: '5px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
              border: '2px solid #86efac',
              boxShadow: '0 0 10px rgba(74, 222, 128, 0.6)',
            }}
          >
            <span className="text-white text-xs font-bold">+</span>
          </div>
        )}

        {/* 설명 영역 (하단) */}
        <div
          className="absolute z-20"
          style={{ height: '45px', left: '10px', right: '10px', bottom: '8px' }}
        >
          <p
            className="font-card text-[10px] text-center leading-tight"
            style={{
              color: damageColor || '#e0e0e0',
              textShadow: '1px 1px 2px #000',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {modifiedDescription}
          </p>
        </div>

        {/* 드래그 중 글로우 오버레이 */}
        {dragState.isDragging && (
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
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
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          />
        )}
      </div>
    </>
  );
}
