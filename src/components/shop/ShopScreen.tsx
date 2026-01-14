import { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Card } from '../combat/Card';
import { Card as CardType, createCardInstance } from '../../types/card';
import { Relic } from '../../types/relic';
import { generateCardRewards } from '../../data/cards';
import { generateRelicReward } from '../../data/relics';
import { randomInt } from '../../utils/shuffle';

interface ShopItem {
  type: 'card' | 'relic' | 'remove';
  item?: CardType | Relic;
  price: number;
  sold: boolean;
}

export function ShopScreen() {
  const { player, setPhase, modifyGold, addCardToDeck, addRelic, removeCardFromDeck } = useGameStore();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  useEffect(() => {
    const cards = generateCardRewards(5);

    // 5개의 유물 생성 (중복 방지)
    const relics: Relic[] = [];
    const usedIds = new Set<string>();
    while (relics.length < 5) {
      const relic = generateRelicReward();
      if (!usedIds.has(relic.id)) {
        relics.push(relic);
        usedIds.add(relic.id);
      }
    }

    const getRelicPrice = (relic: Relic) => {
      switch (relic.rarity) {
        case 'COMMON': return randomInt(140, 160);
        case 'UNCOMMON': return randomInt(200, 240);
        case 'RARE': return randomInt(280, 320);
        case 'UNIQUE': return randomInt(350, 400);
        default: return randomInt(180, 220);
      }
    };

    const items: ShopItem[] = [
      ...cards.map(card => ({
        type: 'card' as const,
        item: card,
        price: card.rarity === 'COMMON' ? randomInt(45, 55) :
          card.rarity === 'UNCOMMON' ? randomInt(68, 82) : randomInt(135, 165),
        sold: false,
      })),
      ...relics.map(relic => ({
        type: 'relic' as const,
        item: relic,
        price: getRelicPrice(relic),
        sold: false,
      })),
      {
        type: 'remove' as const,
        price: 75,
        sold: false,
      },
    ];

    setShopItems(items);
  }, []);

  const handleBuyCard = (index: number) => {
    const item = shopItems[index];
    if (item.sold || player.gold < item.price || item.type !== 'card') return;

    modifyGold(-item.price);
    addCardToDeck(item.item as CardType);

    const newItems = [...shopItems];
    newItems[index].sold = true;
    setShopItems(newItems);
  };

  const handleBuyRelic = (index: number) => {
    const item = shopItems[index];
    if (item.sold || player.gold < item.price || item.type !== 'relic') return;

    modifyGold(-item.price);
    addRelic(item.item as Relic);

    const newItems = [...shopItems];
    newItems[index].sold = true;
    setShopItems(newItems);
  };

  const handleBuyRemove = (index: number) => {
    const item = shopItems[index];
    if (item.sold || player.gold < item.price) return;

    setShowRemoveModal(true);
  };

  const handleRemoveCard = (cardInstanceId: string) => {
    const item = shopItems.find(i => i.type === 'remove' && !i.sold);
    if (!item) return;

    modifyGold(-item.price);
    removeCardFromDeck(cardInstanceId);

    const newItems = [...shopItems];
    const removeIndex = newItems.findIndex(i => i.type === 'remove' && !i.sold);
    if (removeIndex !== -1) {
      newItems[removeIndex].sold = true;
    }
    setShopItems(newItems);
    setShowRemoveModal(false);
  };

  const handleLeave = () => {
    setPhase('MAP');
  };

  const cardItems = shopItems.filter(i => i.type === 'card');
  const relicItems = shopItems.filter(i => i.type === 'relic');
  const removeItem = shopItems.find(i => i.type === 'remove');

  return (
    <div className="w-full h-screen bg-[var(--bg-darkest)] texture-noise flex flex-col items-center p-2 sm:p-8 relative overflow-auto">
      {/* 배경 효과 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center top, rgba(201, 162, 39, 0.15) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* 상단: 골드 */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl mb-3 sm:mb-6 relative z-10"
        style={{
          background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
          border: '2px solid var(--gold)',
          boxShadow: '0 0 20px var(--gold-glow)',
        }}
      >
        <span className="text-xl sm:text-3xl">💰</span>
        <span className="font-title text-lg sm:text-2xl text-[var(--gold-light)]">{player.gold}</span>
      </div>

      <h1
        className="font-title text-2xl sm:text-4xl text-[var(--gold-light)] mb-3 sm:mb-6 relative z-10"
        style={{
          textShadow: '0 0 20px var(--gold-glow), 0 4px 8px rgba(0,0,0,0.8)',
        }}
      >
        상점
      </h1>

      {/* 카드 판매 */}
      <div className="mb-3 sm:mb-6 relative z-10">
        <h2 className="font-title text-sm sm:text-lg text-[var(--gold)] mb-2 sm:mb-4 text-center">카드</h2>
        <div className="flex gap-1 sm:gap-4 scale-50 sm:scale-75 md:scale-100 origin-top">
          {cardItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                onClick={() => handleBuyCard(shopItems.indexOf(item))}
                className={`
                  transition-all duration-300
                  ${item.sold ? 'opacity-30 scale-95' : player.gold >= item.price ? 'cursor-pointer hover:scale-105 hover:-translate-y-2' : 'opacity-50'}
                `}
              >
                <Card
                  card={createCardInstance(item.item as CardType)}
                  isPlayable={!item.sold && player.gold >= item.price}
                  size="md"
                />
              </div>
              <div
                className={`mt-2 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg font-title text-xs sm:text-base ${
                  item.sold ? 'text-gray-500' : player.gold >= item.price ? 'text-[var(--gold-light)]' : 'text-[var(--attack-light)]'
                }`}
                style={{
                  background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                  border: `1px solid ${item.sold ? '#444' : player.gold >= item.price ? 'var(--gold-dark)' : 'var(--attack-dark)'}`,
                }}
              >
                <span>💰</span>
                <span>{item.sold ? '판매됨' : item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 유물 판매 - 모바일에서 가로 스크롤 가능 */}
      <div className="mb-3 sm:mb-6 relative z-10 w-full sm:w-auto overflow-x-auto">
        <h2 className="font-title text-sm sm:text-lg text-[var(--gold)] mb-2 sm:mb-4 text-center">유물</h2>
        <div className="flex gap-2 sm:gap-4 justify-center">
          {relicItems.map((item, index) => {
            const relic = item.item as Relic;
            return (
              <div
                key={index}
                onClick={() => handleBuyRelic(shopItems.indexOf(item))}
                className={`
                  flex flex-col items-center p-2 sm:p-4 rounded-xl transition-all duration-300 flex-shrink-0
                  ${item.sold ? 'opacity-30' : player.gold >= item.price ? 'cursor-pointer hover:scale-105' : 'opacity-50'}
                `}
                style={{
                  background: 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                  border: '2px solid var(--gold-dark)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                }}
              >
                <div
                  className="w-10 h-10 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-1 sm:mb-2 p-1 sm:p-2"
                  style={{
                    background: 'linear-gradient(135deg, var(--bg-light) 0%, var(--bg-dark) 100%)',
                    border: `2px solid ${relic.rarity === 'RARE' ? '#c084fc' : relic.rarity === 'UNIQUE' ? '#e879f9' : 'var(--gold)'}`,
                    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
                  }}
                >
                  {relic.icon ? (
                    <img
                      src={relic.icon}
                      alt={relic.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  ) : (
                    <span className="text-xl sm:text-3xl">❓</span>
                  )}
                </div>
                <span className="font-title text-xs sm:text-base text-[var(--gold-light)]">{relic.name}</span>
                <span className="font-card text-[10px] sm:text-xs text-gray-400 text-center max-w-20 sm:max-w-32 mt-1 hidden sm:block">{relic.description}</span>
                <div
                  className={`mt-1 sm:mt-3 flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg font-title text-xs sm:text-base ${
                    item.sold ? 'text-gray-500' : player.gold >= item.price ? 'text-[var(--gold-light)]' : 'text-[var(--attack-light)]'
                  }`}
                  style={{
                    background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                    border: `1px solid ${item.sold ? '#444' : player.gold >= item.price ? 'var(--gold-dark)' : 'var(--attack-dark)'}`,
                  }}
                >
                  <span>💰</span>
                  <span>{item.sold ? '판매됨' : item.price}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 카드 제거 서비스 */}
      {removeItem && (
        <div className="mb-3 sm:mb-6 relative z-10">
          <button
            onClick={() => handleBuyRemove(shopItems.indexOf(removeItem))}
            disabled={removeItem.sold || player.gold < removeItem.price}
            className={`
              px-4 sm:px-6 py-2 sm:py-4 rounded-xl font-title flex items-center gap-2 sm:gap-3
              transition-all duration-300 text-sm sm:text-base
              ${removeItem.sold ? 'opacity-30' :
                player.gold >= removeItem.price ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}
            `}
            style={{
              background: removeItem.sold ? 'var(--bg-dark)' :
                player.gold >= removeItem.price
                  ? 'linear-gradient(180deg, var(--attack) 0%, var(--attack-dark) 100%)'
                  : 'var(--bg-dark)',
              border: `2px solid ${removeItem.sold ? '#444' :
                player.gold >= removeItem.price ? 'var(--attack-light)' : '#444'}`,
              boxShadow: !removeItem.sold && player.gold >= removeItem.price
                ? '0 0 15px var(--attack-glow)'
                : 'none',
            }}
          >
            <span className="text-lg sm:text-2xl">🗑️</span>
            <span className="text-white">
              카드 제거 - 💰 {removeItem.sold ? '판매됨' : removeItem.price}
            </span>
          </button>
        </div>
      )}

      {/* 나가기 버튼 */}
      <button
        onClick={handleLeave}
        className="btn-game px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg relative z-10"
      >
        상점 나가기
      </button>

      {/* 카드 제거 모달 */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div
            className="rounded-xl p-4 sm:p-8 max-w-4xl max-h-[90vh] overflow-auto"
            style={{
              background: 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
              border: '2px solid var(--attack)',
              boxShadow: '0 0 40px rgba(0,0,0,0.8), 0 0 20px var(--attack-glow)',
            }}
          >
            <h2 className="font-title text-lg sm:text-2xl text-[var(--attack-light)] mb-4 sm:mb-6 text-center">
              제거할 카드 선택
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 scale-75 sm:scale-100 origin-top">
              {player.deck.map(card => (
                <div
                  key={card.instanceId}
                  onClick={() => handleRemoveCard(card.instanceId)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <Card card={card} size="sm" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRemoveModal(false)}
              className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 rounded-lg font-card text-sm sm:text-base text-gray-400 hover:text-white transition-colors block mx-auto"
              style={{
                background: 'linear-gradient(180deg, var(--bg-light) 0%, var(--bg-dark) 100%)',
                border: '1px solid var(--gold-dark)',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
