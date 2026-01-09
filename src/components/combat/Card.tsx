import { CardInstance } from '../../types/card';

interface CardProps {
  card: CardInstance;
  onClick?: () => void;
  isSelected?: boolean;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Card({
  card,
  onClick,
  isSelected = false,
  isPlayable = true,
  size = 'md',
}: CardProps) {
  const typeColors = {
    ATTACK: 'from-red-600 to-red-800 border-red-400',
    SKILL: 'from-blue-600 to-blue-800 border-blue-400',
    POWER: 'from-yellow-600 to-yellow-800 border-yellow-400',
  };

  const rarityGlow = {
    BASIC: '',
    COMMON: '',
    UNCOMMON: 'ring-2 ring-blue-400',
    RARE: 'ring-2 ring-yellow-400',
  };

  const sizes = {
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-40 h-60',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`
        ${sizes[size]}
        relative rounded-lg border-2 overflow-hidden
        bg-gradient-to-b ${typeColors[card.type]}
        ${rarityGlow[card.rarity]}
        ${isSelected ? 'ring-4 ring-white transform -translate-y-4 scale-110' : ''}
        ${isPlayable ? 'cursor-pointer hover:-translate-y-2 hover:scale-105' : 'opacity-50 cursor-not-allowed'}
        transition-all duration-200
        shadow-lg
      `}
    >
      {/* 비용 */}
      <div className="absolute top-1 left-1 w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-yellow-400">
        <span className="text-yellow-400 font-bold">{card.cost}</span>
      </div>

      {/* 업그레이드 표시 */}
      {card.upgraded && (
        <div className="absolute top-1 right-1 text-green-400 font-bold">+</div>
      )}

      {/* 카드 이름 */}
      <div className="absolute top-10 left-0 right-0 text-center">
        <span className={`${textSizes[size]} font-bold text-white drop-shadow-md`}>
          {card.name}
        </span>
      </div>

      {/* 카드 타입 아이콘 영역 */}
      <div className="absolute top-1/3 left-0 right-0 flex justify-center">
        <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center">
          <span className="text-3xl">
            {card.type === 'ATTACK' ? '⚔️' : card.type === 'SKILL' ? '🛡️' : '✨'}
          </span>
        </div>
      </div>

      {/* 설명 */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/50 rounded p-1">
        <p className={`${textSizes[size]} text-white text-center leading-tight`}>
          {card.description}
        </p>
      </div>
    </div>
  );
}
