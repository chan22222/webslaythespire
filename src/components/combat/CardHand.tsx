import { useState } from 'react';
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
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // 슬더슬 스타일 부채꼴 배치 계산
  const getCardTransform = (index: number, total: number) => {
    if (total === 1) {
      return { rotation: 0, offsetY: 0, offsetX: 0 };
    }

    const midPoint = (total - 1) / 2;
    const normalizedIndex = (index - midPoint) / midPoint; // -1 ~ 1

    // 회전: 중앙 0도, 양끝 ±10도
    const rotation = normalizedIndex * 10;

    // Y 오프셋: 아치형 곡선 (중앙이 가장 높음)
    const offsetY = Math.pow(Math.abs(normalizedIndex), 1.5) * 30;

    // X 오프셋: 겹침 조절
    const spacing = Math.min(110, 650 / total);
    const offsetX = (index - midPoint) * spacing;

    return { rotation, offsetY, offsetX };
  };

  // 카드가 없으면 빈 공간
  if (cards.length === 0) {
    return <div className="h-64" />;
  }

  return (
    <div
      className="relative flex justify-center items-end"
      style={{
        height: '280px',
        width: '100%',
        paddingBottom: '40px',
      }}
    >
      {/* 카드 렌더링 */}
      <div className="relative flex justify-center" style={{ width: '900px' }}>
        {cards.map((card, index) => {
          const { rotation, offsetY, offsetX } = getCardTransform(index, cards.length);
          const isSelected = selectedCardId === card.instanceId;
          const isHovered = hoveredCardId === card.instanceId;

          // z-index 계산: 기본 10 + index, 호버 시 50, 선택 시 100
          let zIndex = 10 + index;
          if (isHovered) zIndex = 50;
          if (isSelected) zIndex = 100;

          return (
            <div
              key={card.instanceId}
              className="absolute transition-all duration-150 ease-out"
              style={{
                left: '50%',
                bottom: '0',
                transform: `
                  translateX(calc(-50% + ${offsetX}px))
                  translateY(${isSelected || isHovered ? 0 : offsetY}px)
                `,
                zIndex,
              }}
            >
              <DraggableCard
                card={card}
                isSelected={isSelected}
                isPlayable={card.cost <= energy}
                onSelect={() => onCardSelect(card.instanceId)}
                onDragEnd={(x, y, dist) => onCardDragEnd(card.instanceId, x, y, dist)}
                rotation={isSelected || isHovered ? 0 : rotation}
                onHoverChange={(hovered) => {
                  if (hovered) {
                    setHoveredCardId(card.instanceId);
                  } else if (hoveredCardId === card.instanceId) {
                    setHoveredCardId(null);
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
