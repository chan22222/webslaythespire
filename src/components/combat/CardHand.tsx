import { CardInstance } from '../../types/card';
import { DraggableCard } from './DraggableCard';

interface CardHandProps {
  cards: CardInstance[];
  energy: number;
  selectedCardId: string | null;
  onCardSelect: (cardInstanceId: string) => void;
  onCardDragEnd: (cardInstanceId: string, x: number, y: number, dragDistance: number) => void;
}

export function CardHand({
  cards,
  energy,
  selectedCardId,
  onCardSelect,
  onCardDragEnd,
}: CardHandProps) {
  // 슬더슬 스타일 부채꼴 배치 계산
  const getCardTransform = (index: number, total: number) => {
    if (total === 1) {
      return { rotation: 0, offsetY: 0, offsetX: 0 };
    }

    const midPoint = (total - 1) / 2;
    const normalizedIndex = (index - midPoint) / midPoint; // -1 ~ 1

    // 회전: 중앙 0도, 양끝 ±12도
    const rotation = normalizedIndex * 8;

    // Y 오프셋: 아치형 곡선 (중앙이 가장 높음)
    const offsetY = Math.pow(Math.abs(normalizedIndex), 1.5) * 25;

    // X 오프셋: 겹침 조절
    const spacing = Math.min(100, 600 / total);
    const offsetX = (index - midPoint) * spacing;

    return { rotation, offsetY, offsetX };
  };

  // 카드가 없으면 빈 공간
  if (cards.length === 0) {
    return <div className="h-56" />;
  }

  return (
    <div
      className="relative flex justify-center items-end"
      style={{
        height: '240px',
        width: '100%',
        paddingBottom: '10px',
      }}
    >
      {/* 카드 렌더링 */}
      <div className="relative flex justify-center" style={{ width: '800px' }}>
        {cards.map((card, index) => {
          const { rotation, offsetY, offsetX } = getCardTransform(index, cards.length);
          const isSelected = selectedCardId === card.instanceId;

          return (
            <div
              key={card.instanceId}
              className="absolute transition-all duration-200 ease-out"
              style={{
                left: '50%',
                bottom: '0',
                transform: `
                  translateX(calc(-50% + ${offsetX}px))
                  translateY(${isSelected ? -60 : offsetY}px)
                  rotate(${isSelected ? 0 : rotation}deg)
                `,
                zIndex: isSelected ? 100 : 10 + index,
              }}
            >
              <DraggableCard
                card={card}
                isSelected={isSelected}
                isPlayable={card.cost <= energy}
                onSelect={() => onCardSelect(card.instanceId)}
                onDragEnd={(x, y, dist) => onCardDragEnd(card.instanceId, x, y, dist)}
                rotation={0}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
