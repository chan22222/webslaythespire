import { Card as CardType, CardInstance } from '../../types/card';
import { useCombatStore } from '../../stores/combatStore';

type CardSize = 'xs' | 'sm' | 'md' | 'lg';

interface CardProps {
  card: CardType | CardInstance;
  onClick?: () => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  size?: CardSize;
  showRemoveHint?: boolean;
}

const typeConfig = {
  ATTACK: {
    cardImage: '/cards/attackcard.png',
    accentColor: '#e8a040',
    glowColor: 'rgba(232, 160, 64, 0.6)',
    typeName: 'Attack',
  },
  SHIELD: {
    cardImage: '/cards/shieldcard.png',
    accentColor: '#40a8e8',
    glowColor: 'rgba(64, 168, 232, 0.6)',
    typeName: 'Shield',
  },
  GADGET: {
    cardImage: '/cards/gadgetcard.png',
    accentColor: '#40e8a0',
    glowColor: 'rgba(64, 232, 160, 0.6)',
    typeName: 'Gadget',
  },
  EFFECT: {
    cardImage: '/cards/effectcard.png',
    accentColor: '#a040e8',
    glowColor: 'rgba(160, 64, 232, 0.6)',
    typeName: 'Effect',
  },
  TERRAIN: {
    cardImage: '/cards/terraincard.png',
    accentColor: '#8b6914',
    glowColor: 'rgba(139, 105, 20, 0.6)',
    typeName: 'Terrain',
  },
};

// 기준: 전투 카드 140x195 (비율 1:1.393)
const BASE_WIDTH = 140;
const BASE_HEIGHT = 195;
const RATIO = BASE_HEIGHT / BASE_WIDTH; // 1.392857

const createSizeConfig = (width: number) => {
  const scale = width / BASE_WIDTH;
  const height = Math.round(width * RATIO);
  return {
    width,
    height,
    // 이름: 더 위로, 더 크게
    nameTop: Math.round(14 * scale),
    nameFontSize: Math.round(9 * scale),
    // 타입: 중앙 하단 (설명 바로 위)
    typeBottom: Math.round(55 * scale),
    typeFontSize: Math.round(7 * scale),
    // 코스트: 좌상단
    costSize: Math.round(28 * scale),
    costTop: Math.round(7 * scale),
    costLeft: Math.round(9 * scale),
    costFontSize: Math.round(14 * scale),
    // 업그레이드
    upgradeSize: Math.round(18 * scale),
    upgradeTop: Math.round(5 * scale),
    upgradeRight: Math.round(5 * scale),
    upgradeFontSize: Math.round(10 * scale),
    // 설명 (좌우 여백)
    descHeight: Math.round(45 * scale),
    descFontSize: Math.round(10 * scale),
    descPadding: Math.round(10 * scale),
    descBottom: Math.round(8 * scale),
  };
};

const sizeConfig = {
  xs: createSizeConfig(80),   // 80x111
  sm: createSizeConfig(100),  // 100x139
  md: createSizeConfig(140),  // 140x195 (기준)
  lg: createSizeConfig(180),  // 180x251
};

const rarityGlow = {
  BASIC: '',
  COMMON: '',
  UNCOMMON: '0 0 12px rgba(100, 150, 255, 0.5)',
  RARE: '0 0 12px rgba(255, 200, 50, 0.5)',
};

export function Card({
  card,
  onClick,
  isSelected = false,
  isPlayable = true,
  size = 'md',
  showRemoveHint = false,
}: CardProps) {
  const config = typeConfig[card.type];
  const s = sizeConfig[size];

  // 전투 중인 경우에만 플레이어 상태 반영
  const playerStatuses = useCombatStore(state => state.playerStatuses);
  const enemies = useCombatStore(state => state.enemies);
  const isInCombat = enemies.length > 0;

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

    // 단일 타겟이고 취약한 적이 있으면 취약 보너스 표시 (참고용)
    // 실제 적용은 적마다 다르므로 여기선 기본 데미지만 계산

    return Math.max(0, damage);
  };

  // 데미지가 수정되었는지 확인하고 설명 업데이트
  const getModifiedDescription = () => {
    let description = card.description;

    // 전투 중이 아니면 원본 반환
    if (!isInCombat) {
      return description;
    }

    // effects가 없으면 원본 반환
    if (!card.effects || card.effects.length === 0) {
      return description;
    }

    // 힘이나 약화가 있는지 확인
    const strength = playerStatuses.find(s => s.type === 'STRENGTH')?.stacks || 0;
    const weak = playerStatuses.find(s => s.type === 'WEAK');
    const hasModifier = strength !== 0 || (weak && weak.stacks > 0);

    if (!hasModifier) {
      return description;
    }

    // DAMAGE 효과 찾아서 수정된 값으로 교체
    for (const effect of card.effects) {
      if (effect.type === 'DAMAGE') {
        const baseDamage = effect.value;
        const modifiedDamage = calculateModifiedDamage(baseDamage);

        if (baseDamage !== modifiedDamage) {
          // "실제 (원래) 피해" 형식으로 표시
          const pattern = new RegExp(`${baseDamage} 피해`, 'g');
          if (pattern.test(description)) {
            description = description.replace(pattern, `${modifiedDamage} (${baseDamage}) 피해`);
          }
        }
      }
    }

    return description;
  };

  const modifiedDescription = getModifiedDescription();

  // 데미지가 변경되었는지 확인 (색상 표시용)
  const getDamageColor = () => {
    if (!isInCombat || !card.effects) return null;

    for (const effect of card.effects) {
      if (effect.type === 'DAMAGE') {
        const baseDamage = effect.value;
        const modifiedDamage = calculateModifiedDamage(baseDamage);

        if (modifiedDamage > baseDamage) return '#4ade80'; // 증가: 초록
        if (modifiedDamage < baseDamage) return '#ff6b6b'; // 감소: 빨강
      }
    }
    return null;
  };

  const damageColor = getDamageColor();

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative rounded-lg overflow-hidden
        ${isSelected ? 'ring-2 ring-white transform -translate-y-2 scale-105' : ''}
        ${isPlayable ? 'cursor-pointer hover:-translate-y-1 hover:scale-102' : 'opacity-50 cursor-not-allowed'}
        transition-all duration-200
      `}
      style={{
        width: `${s.width}px`,
        height: `${s.height}px`,
        boxShadow: isSelected
          ? `0 0 20px ${config.glowColor}, ${rarityGlow[card.rarity]}`
          : `0 4px 12px rgba(0,0,0,0.4), ${rarityGlow[card.rarity]}`,
      }}
    >
      {/* 카드 아트 이미지 (프레임 뒤) */}
      {card.image && (
        <img
          src={card.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
          draggable={false}
        />
      )}

      {/* 카드 프레임 이미지 배경 */}
      <img
        src={config.cardImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 1 }}
        draggable={false}
      />

      {/* 카드 이름 */}
      <div
        className="absolute left-1 right-1 z-20 text-center"
        style={{ top: `${s.nameTop}px` }}
      >
        <span
          className="font-card"
          style={{
            fontSize: `${s.nameFontSize}px`,
            color: '#fff',
            textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
            fontWeight: 600,
          }}
        >
          {card.name}
        </span>
      </div>

      {/* 카드 타입 - 중앙 하단 (설명 위) */}
      <div
        className="absolute left-1 right-1 z-30 text-center"
        style={{ bottom: `${s.typeBottom}px` }}
      >
        <span
          className="font-card"
          style={{
            fontSize: `${s.typeFontSize}px`,
            color: config.accentColor,
            textShadow: '1px 1px 0 #000',
          }}
        >
          {config.typeName}
        </span>
      </div>

      {/* 카드 비용 - 좌상단 */}
      <div
        className="absolute z-30 flex items-center justify-center"
        style={{
          width: `${s.costSize}px`,
          height: `${s.costSize}px`,
          top: `${s.costTop}px`,
          left: `${s.costLeft}px`,
        }}
      >
        <span
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: `${s.costFontSize}px`,
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
            width: `${s.upgradeSize}px`,
            height: `${s.upgradeSize}px`,
            top: `${s.upgradeTop}px`,
            right: `${s.upgradeRight}px`,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
            border: '1px solid #86efac',
            boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)',
          }}
        >
          <span
            className="text-white font-bold"
            style={{ fontSize: `${s.upgradeFontSize}px` }}
          >
            +
          </span>
        </div>
      )}

      {/* 설명 영역 */}
      <div
        className="absolute z-20"
        style={{
          height: `${s.descHeight}px`,
          left: `${s.descPadding}px`,
          right: `${s.descPadding}px`,
          bottom: `${s.descBottom}px`,
        }}
      >
        <p
          className="font-card text-center leading-tight"
          style={{
            fontSize: `${s.descFontSize}px`,
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

      {/* 제거 힌트 오버레이 */}
      {showRemoveHint && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(220, 38, 38, 0.7)' }}
        >
          <span
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: `${s.nameFontSize}px`,
              color: '#fff',
              textShadow: '1px 1px 0 #000',
            }}
          >
            제거
          </span>
        </div>
      )}
    </div>
  );
}
