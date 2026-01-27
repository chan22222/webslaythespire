import { useState, useRef, useEffect, useMemo } from 'react';
import { CardInstance } from '../../types/card';
import { DraggableCard } from './DraggableCard';
import { useCombatStore } from '../../stores/combatStore';

// 화면 크기에 따른 카드 간격 계산
function useCardSpacing() {
  const [containerWidth, setContainerWidth] = useState(900);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setContainerWidth(260);  // 작은 모바일
      } else if (width < 640) {
        setContainerWidth(320);  // 큰 모바일 (더 작게 조정)
      } else if (width < 768) {
        setContainerWidth(480);  // 태블릿 세로
      } else if (width < 1024) {
        setContainerWidth(700);  // 태블릿 가로
      } else {
        setContainerWidth(900);  // 데스크톱
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return containerWidth;
}

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
  const isPlayingCard = useCombatStore(state => state.isPlayingCard);
  const containerWidth = useCardSpacing();
  // 새로 추가된 카드 추적
  const [newCardIds, setNewCardIds] = useState<Set<string>>(new Set());
  const [cardDelays, setCardDelays] = useState<Map<string, number>>(new Map());
  // 버려지는 카드 추적
  const [discardingCards, setDiscardingCards] = useState<CardInstance[]>([]);
  const [discardDelays, setDiscardDelays] = useState<Map<string, number>>(new Map());
  const prevCardsRef = useRef<CardInstance[]>([]);
  const prevCardIdsRef = useRef<Set<string>>(new Set());

  // 카드 ID Set 캐싱
  const currentIds = useMemo(
    () => new Set(cards.map(c => c.instanceId)),
    [cards]
  );

  useEffect(() => {
    const prevIds = prevCardIdsRef.current;
    const prevCards = prevCardsRef.current;
    const timers: NodeJS.Timeout[] = [];

    // 새로 추가된 카드 찾기
    const newIds: string[] = [];
    cards.forEach(card => {
      if (!prevIds.has(card.instanceId)) {
        newIds.push(card.instanceId);
      }
    });

    if (newIds.length > 0) {
      // 새 카드들에 순차적 딜레이 설정
      const delays = new Map(cardDelays);
      newIds.forEach((id, index) => {
        delays.set(id, index * 80); // 80ms 간격으로 순차 등장
      });
      setCardDelays(delays);
      setNewCardIds(new Set(newIds));

      // 애니메이션 완료 후 상태 정리
      const maxDelay = newIds.length * 80 + 300;
      timers.push(setTimeout(() => {
        setNewCardIds(new Set());
        setCardDelays(new Map());
      }, maxDelay));
    }

    // 제거된 카드 찾기 (2장 이상 동시 제거 = 턴 종료 버리기)
    const removedCards: CardInstance[] = [];
    prevCards.forEach(card => {
      if (!currentIds.has(card.instanceId)) {
        removedCards.push(card);
      }
    });

    if (removedCards.length > 1) {
      // 여러 장 버리기: 순차 애니메이션
      const delays = new Map<string, number>();
      removedCards.forEach((card, index) => {
        delays.set(card.instanceId, index * 60); // 60ms 간격
      });
      setDiscardDelays(delays);
      setDiscardingCards(removedCards);

      // 애니메이션 완료 후 정리
      const maxDelay = removedCards.length * 60 + 350;
      timers.push(setTimeout(() => {
        setDiscardingCards([]);
        setDiscardDelays(new Map());
      }, maxDelay));
    }

    prevCardIdsRef.current = currentIds;
    prevCardsRef.current = [...cards];

    // Cleanup: 컴포넌트 언마운트 시 타이머 정리
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [cards, currentIds]);

  // 슬더슬 스타일 부채꼴 배치 계산 (화면 크기 반응형)
  const getCardTransform = useMemo(() => (index: number, total: number) => {
    if (total === 1) {
      return { rotation: 0, offsetY: 0, offsetX: 0 };
    }

    const midPoint = (total - 1) / 2;
    const normalizedIndex = (index - midPoint) / midPoint; // -1 ~ 1

    // 회전: 중앙 0도, 양끝 ±10도 (모바일에서 더 작게)
    const maxRotation = containerWidth < 480 ? 6 : containerWidth < 768 ? 8 : 10;
    const rotation = normalizedIndex * maxRotation;

    // Y 오프셋: 아치형 곡선 (중앙이 가장 높음, 모바일에서 더 작게)
    const maxOffsetY = containerWidth < 480 ? 15 : containerWidth < 768 ? 22 : 30;
    const offsetY = Math.pow(Math.abs(normalizedIndex), 1.5) * maxOffsetY;

    // X 오프셋: 겹침 조절 (화면 크기에 맞게)
    const baseSpacing = containerWidth * 0.72; // 컨테이너 너비의 72%를 카드 배치에 사용
    const spacing = Math.min(containerWidth < 480 ? 55 : 110, baseSpacing / total);
    const offsetX = (index - midPoint) * spacing;

    return { rotation, offsetY, offsetX };
  }, [containerWidth]);

  // 카드가 없고 버려지는 카드도 없으면 빈 공간
  if (cards.length === 0 && discardingCards.length === 0) {
    return <div className="h-64" />;
  }

  return (
    <div
      className="combat-hand relative flex justify-center items-end pointer-events-none"
      style={{
        height: '280px',
        width: '100%',
        paddingBottom: '40px',
      }}
    >
      {/* 카드 렌더링 */}
      <div className="relative flex justify-center w-[260px] xs:w-[320px] sm:w-[480px] md:w-[700px] lg:w-[900px]">
        {cards.map((card, index) => {
          const { rotation, offsetY, offsetX } = getCardTransform(index, cards.length);
          const isSelected = selectedCardId === card.instanceId;
          const isHovered = hoveredCardId === card.instanceId;
          const isNewCard = newCardIds.has(card.instanceId);
          const delay = cardDelays.get(card.instanceId) || 0;

          // z-index 계산: 기본 10 + index, 호버 시 50, 선택 시 100
          let zIndex = 10 + index;
          if (isHovered) zIndex = 50;
          if (isSelected) zIndex = 100;

          return (
            <div
              key={card.instanceId}
              className="absolute transition-all duration-150 ease-out pointer-events-auto"
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
              {/* 새 카드 등장 애니메이션 래퍼 */}
              <div
                style={{
                  animation: isNewCard ? `cardDraw 0.35s ease-out ${delay}ms both` : undefined,
                }}
              >
                <DraggableCard
                  card={card}
                  isSelected={isSelected}
                  isPlayable={card.cost <= energy && !isPlayingCard}
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
            </div>
          );
        })}

        {/* 버려지는 카드 애니메이션 */}
        {discardingCards.map((card, index) => {
          const total = discardingCards.length;
          const { rotation, offsetY, offsetX } = getCardTransform(index, total);
          const delay = discardDelays.get(card.instanceId) || 0;

          return (
            <div
              key={`discard-${card.instanceId}`}
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                bottom: '0',
                transform: `
                  translateX(calc(-50% + ${offsetX}px))
                  translateY(${offsetY}px)
                `,
                zIndex: 5 + index,
              }}
            >
              <div
                style={{
                  animation: `cardDiscard 0.3s ease-in ${delay}ms both`,
                }}
              >
                <DraggableCard
                  card={card}
                  isSelected={false}
                  isPlayable={false}
                  onSelect={() => {}}
                  onDragEnd={() => {}}
                  rotation={rotation}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
