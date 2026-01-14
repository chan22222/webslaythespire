import { useState, useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Card, CardInstance, createCardInstance } from '../../types/card';
import { EnemyTemplate } from '../../types/enemy';
import { Relic } from '../../types/relic';
import { Card as CardComponent } from '../combat/Card';
import { STRIKE, DEFEND, BASH, EXPOSE_WEAKNESS, FLEXIBLE_RESPONSE } from '../../data/cards/starterCards';
import { COMMON_CARDS } from '../../data/cards/commonCards';
import { UNCOMMON_CARDS } from '../../data/cards/uncommonCards';
import { RARE_CARDS } from '../../data/cards/rareCards';
import { UNIQUE_CARDS } from '../../data/cards/uniqueCards';
import {
  CULTIST,
  JAW_WORM,
  LOUSE_RED,
  LOUSE_GREEN,
  ACID_SLIME_M,
  SPIKE_SLIME_M,
  GREMLIN_NOB,
  SLIME_BOSS,
} from '../../data/enemies/act1Enemies';
import { ALL_RELICS } from '../../data/relics';

// 선택 가능한 적 목록
const ENEMY_OPTIONS: { template: EnemyTemplate; label: string; type: 'normal' | 'elite' | 'boss' }[] = [
  { template: CULTIST, label: '컬티스트', type: 'normal' },
  { template: JAW_WORM, label: '턱 벌레', type: 'normal' },
  { template: LOUSE_RED, label: '붉은 이', type: 'normal' },
  { template: LOUSE_GREEN, label: '녹색 이', type: 'normal' },
  { template: ACID_SLIME_M, label: '산성 슬라임', type: 'normal' },
  { template: SPIKE_SLIME_M, label: '가시 슬라임', type: 'normal' },
  { template: GREMLIN_NOB, label: '고위 노블레스', type: 'elite' },
  { template: SLIME_BOSS, label: '슬라임 보스', type: 'boss' },
];

const MIN_DECK_SIZE = 10;
const MAX_DECK_SIZE = 30;

// 모든 사용 가능한 카드
const ALL_CARDS: Card[] = [
  STRIKE,
  DEFEND,
  BASH,
  EXPOSE_WEAKNESS,
  FLEXIBLE_RESPONSE,
  ...COMMON_CARDS,
  ...UNCOMMON_CARDS,
  ...RARE_CARDS,
  ...UNIQUE_CARDS,
];

const typeStyles = {
  ALL: { bg: '#3a3025', border: '#d4a84b', color: '#f0d090' },
  ATTACK: { bg: '#4a2020', border: '#e8a040', color: '#f0b860' },
  SHIELD: { bg: '#204a4a', border: '#40a8e8', color: '#60c8f8' },
  GADGET: { bg: '#204a3a', border: '#40e8a0', color: '#60f8b0' },
  EFFECT: { bg: '#3a204a', border: '#a040e8', color: '#c060f8' },
  TERRAIN: { bg: '#4a3a20', border: '#8b6914', color: '#ab8934' },
};

type SortBy = 'cost' | 'name' | 'type' | 'rarity';
type SortOrder = 'asc' | 'desc';

const rarityOrder = { BASIC: 0, COMMON: 1, UNCOMMON: 2, RARE: 3, UNIQUE: 4 };

export function DeckBuildingScreen() {
  const { setDeck, setPhase, startTestBattle, startGameWithDeckAndRelics } = useGameStore();
  const [selectedCards, setSelectedCards] = useState<CardInstance[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ATTACK' | 'SHIELD' | 'GADGET' | 'EFFECT' | 'TERRAIN'>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('rarity');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedEnemies, setSelectedEnemies] = useState<EnemyTemplate[]>([]);
  const [selectedRelics, setSelectedRelics] = useState<Relic[]>([]);

  const filteredCards = useMemo(() => {
    let cards = filter === 'ALL' ? [...ALL_CARDS] : ALL_CARDS.filter(card => card.type === filter);

    cards.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'cost':
          comparison = a.cost - b.cost;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name, 'ko');
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'rarity':
          comparison = rarityOrder[a.rarity] - rarityOrder[b.rarity];
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return cards;
  }, [filter, sortBy, sortOrder]);

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const addCard = (card: Card) => {
    if (selectedCards.length >= MAX_DECK_SIZE) return;
    const cardInstance = createCardInstance(card);
    setSelectedCards([...selectedCards, cardInstance]);
  };

  const removeCard = (instanceId: string) => {
    setSelectedCards(selectedCards.filter(c => c.instanceId !== instanceId));
  };

  const toggleEnemy = (enemy: EnemyTemplate) => {
    if (selectedEnemies.includes(enemy)) {
      setSelectedEnemies(selectedEnemies.filter(e => e !== enemy));
    } else if (selectedEnemies.length < 3) {
      setSelectedEnemies([...selectedEnemies, enemy]);
    }
  };

  const toggleRelic = (relic: Relic) => {
    if (selectedRelics.some(r => r.id === relic.id)) {
      setSelectedRelics(selectedRelics.filter(r => r.id !== relic.id));
    } else if (selectedRelics.length < 5) {
      setSelectedRelics([...selectedRelics, relic]);
    }
  };

  const startGame = () => {
    if (selectedCards.length < MIN_DECK_SIZE) return;

    setDeck(selectedCards);

    if (selectedEnemies.length > 0) {
      // 적 선택 시: 바로 테스트 전투 시작
      startTestBattle(selectedEnemies, selectedRelics);
    } else {
      // 적 미선택 시: 맵으로 이동
      startGameWithDeckAndRelics(selectedRelics);
    }
  };

  const goBack = () => {
    setPhase('MAIN_MENU');
  };

  // 카드 타입별 개수
  const deckStats = useMemo(() => {
    return {
      attacks: selectedCards.filter(c => c.type === 'ATTACK').length,
      shields: selectedCards.filter(c => c.type === 'SHIELD').length,
      gadgets: selectedCards.filter(c => c.type === 'GADGET').length,
      effects: selectedCards.filter(c => c.type === 'EFFECT').length,
      terrains: selectedCards.filter(c => c.type === 'TERRAIN').length,
    };
  }, [selectedCards]);

  // 같은 카드별로 그룹화
  const groupedCards = useMemo(() => {
    const groups: { card: CardInstance; count: number; instances: string[] }[] = [];
    selectedCards.forEach(card => {
      const existing = groups.find(g => g.card.id === card.id);
      if (existing) {
        existing.count++;
        existing.instances.push(card.instanceId);
      } else {
        groups.push({ card, count: 1, instances: [card.instanceId] });
      }
    });
    return groups;
  }, [selectedCards]);

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: 'var(--bg-darkest)' }}>
      {/* 헤더 */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: 'linear-gradient(180deg, rgba(30,25,20,0.98) 0%, rgba(15,12,10,0.95) 100%)',
          borderBottom: '2px solid var(--gold-dark)',
        }}
      >
        <button
          onClick={goBack}
          className="px-4 py-2 rounded-lg font-title text-sm transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(180deg, #2a2015 0%, #0a0805 100%)',
            border: '1px solid var(--gold-dark)',
            color: 'var(--gold)',
          }}
        >
          ← 뒤로
        </button>

        <h1
          className="font-display text-2xl tracking-wider"
          style={{ color: 'var(--gold-light)', textShadow: '0 0 20px rgba(212, 168, 75, 0.4)' }}
        >
          덱 빌딩
        </h1>

        <div className="flex items-center gap-4">
          <div className="font-title text-sm" style={{ color: 'var(--gold)' }}>
            <span className="text-xl font-bold">{selectedCards.length}</span>
            <span className="text-gray-400"> / {MAX_DECK_SIZE}</span>
            {selectedCards.length < MIN_DECK_SIZE && (
              <span className="text-red-400 ml-2 text-xs">(최소 {MIN_DECK_SIZE}장)</span>
            )}
          </div>
          <button
            onClick={startGame}
            disabled={selectedCards.length < MIN_DECK_SIZE}
            className={`px-6 py-2 rounded-lg font-title text-sm transition-all ${
              selectedCards.length >= MIN_DECK_SIZE
                ? 'hover:scale-105 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{
              background: selectedCards.length >= MIN_DECK_SIZE
                ? 'linear-gradient(180deg, #3a5a2a 0%, #1a2a10 100%)'
                : 'linear-gradient(180deg, #2a2a2a 0%, #0a0a0a 100%)',
              border: `2px solid ${selectedCards.length >= MIN_DECK_SIZE ? '#4ade80' : '#444'}`,
              color: selectedCards.length >= MIN_DECK_SIZE ? '#4ade80' : '#666',
              boxShadow: selectedCards.length >= MIN_DECK_SIZE
                ? '0 0 15px rgba(74, 222, 128, 0.3)'
                : 'none',
            }}
          >
            {selectedEnemies.length > 0 ? '전투 시작' : '게임 시작'} →
          </button>
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽: 카드 풀 */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* 필터 & 정렬 */}
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            {/* 필터 */}
            <div className="flex gap-2 flex-wrap">
            {(['ALL', 'ATTACK', 'SHIELD', 'GADGET', 'EFFECT', 'TERRAIN'] as const).map(type => {
              const style = typeStyles[type];
              const count = type === 'ALL'
                ? ALL_CARDS.length
                : ALL_CARDS.filter(c => c.type === type).length;

              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg font-title text-xs transition-all flex items-center gap-2 ${
                    filter === type ? 'scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    background: filter === type
                      ? `linear-gradient(180deg, ${style.bg} 0%, #0a0805 100%)`
                      : 'linear-gradient(180deg, #2a2520 0%, #0a0805 100%)',
                    border: `1px solid ${filter === type ? style.border : '#3a3530'}`,
                    color: filter === type ? style.color : '#888',
                  }}
                >
                  <span>{type === 'ALL' ? 'All' : type}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      color: filter === type ? style.color : '#666',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            </div>

            {/* 구분선 */}
            <div className="w-px h-6 bg-gray-600" />

            {/* 정렬 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">정렬:</span>
              {([
                { key: 'rarity', label: '레어도' },
                { key: 'cost', label: '코스트' },
                { key: 'name', label: '이름' },
                { key: 'type', label: '타입' },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleSort(key)}
                  className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                    sortBy === key ? 'scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    background: sortBy === key
                      ? 'linear-gradient(180deg, #3a3530 0%, #1a1510 100%)'
                      : 'transparent',
                    border: `1px solid ${sortBy === key ? '#d4a84b' : '#3a3530'}`,
                    color: sortBy === key ? '#f0d090' : '#888',
                  }}
                >
                  <span>{label}</span>
                  {sortBy === key && (
                    <span className="text-[10px]">
                      {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 카드 목록 */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="flex flex-wrap gap-4 justify-start pt-4">
              {filteredCards.map((card, index) => (
                <div
                  key={`${card.id}-${index}`}
                  className="cursor-pointer transition-transform hover:scale-105 hover:z-10 relative inline-block group"
                  style={{ width: '180px', height: '251px' }}
                  onClick={() => addCard(card)}
                >
                  <CardComponent card={card} size="lg" />
                  {/* 추가 힌트 */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none"
                    style={{ background: 'rgba(74, 222, 128, 0.5)' }}
                  >
                    <span className="text-white text-2xl font-bold">+</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 중간: 유물 선택 패널 */}
        <div
          className="w-56 flex flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(20,18,15,0.95) 0%, rgba(10,8,5,0.98) 100%)',
            borderLeft: '2px solid var(--gold-dark)',
            borderRight: '2px solid var(--gold-dark)',
          }}
        >
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="font-title text-sm" style={{ color: 'var(--gold-light)' }}>
                유물
              </h2>
              <span className="text-xs text-gray-500">
                {selectedRelics.length}/5
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1.5">
              {ALL_RELICS.map((relic) => {
                const isSelected = selectedRelics.some(r => r.id === relic.id);
                const rarityColor = relic.rarity === 'STARTER' ? '#4ade80'
                  : relic.rarity === 'COMMON' ? '#a3a3a3'
                  : relic.rarity === 'UNCOMMON' ? '#4a9eff'
                  : relic.rarity === 'RARE' ? '#b440dc'
                  : '#ffc832';
                const rarityBg = relic.rarity === 'STARTER' ? 'rgba(74, 222, 128, 0.15)'
                  : relic.rarity === 'COMMON' ? 'rgba(163, 163, 163, 0.15)'
                  : relic.rarity === 'UNCOMMON' ? 'rgba(74, 158, 255, 0.15)'
                  : relic.rarity === 'RARE' ? 'rgba(180, 64, 220, 0.15)'
                  : 'rgba(255, 200, 50, 0.15)';

                return (
                  <button
                    key={relic.id}
                    onClick={() => toggleRelic(relic)}
                    className="w-full p-2 rounded text-left transition-all hover:brightness-125"
                    style={{
                      background: isSelected ? rarityBg : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${isSelected ? rarityColor : '#555'}`,
                    }}
                  >
                    <div
                      className="font-title text-sm"
                      style={{ color: isSelected ? rarityColor : '#ccc' }}
                    >
                      {relic.name}
                    </div>
                    <div className="text-xs mt-0.5 line-clamp-2" style={{ color: isSelected ? '#999' : '#999' }}>
                      {relic.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 오른쪽: 현재 덱 + 적 선택 */}
        <div
          className="w-72 flex flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(20,18,15,0.95) 0%, rgba(10,8,5,0.98) 100%)',
            borderLeft: '2px solid var(--gold-dark)',
          }}
        >
          {/* 덱 헤더 */}
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-title text-base" style={{ color: 'var(--gold-light)' }}>
                내 덱
              </h2>
              {selectedCards.length > 0 && (
                <button
                  onClick={() => setSelectedCards([])}
                  className="px-2 py-1 rounded text-xs transition-all hover:scale-105"
                  style={{
                    background: 'rgba(220, 38, 38, 0.2)',
                    border: '1px solid rgba(220, 38, 38, 0.5)',
                    color: '#f87171',
                  }}
                >
                  비우기
                </button>
              )}
            </div>

            {/* 타입별 통계 */}
            <div className="flex gap-1 flex-wrap">
              {deckStats.attacks > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: typeStyles.ATTACK.bg, color: typeStyles.ATTACK.color, border: `1px solid ${typeStyles.ATTACK.border}` }}>
                  공격 {deckStats.attacks}
                </span>
              )}
              {deckStats.shields > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: typeStyles.SHIELD.bg, color: typeStyles.SHIELD.color, border: `1px solid ${typeStyles.SHIELD.border}` }}>
                  방어 {deckStats.shields}
                </span>
              )}
              {deckStats.gadgets > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: typeStyles.GADGET.bg, color: typeStyles.GADGET.color, border: `1px solid ${typeStyles.GADGET.border}` }}>
                  가젯 {deckStats.gadgets}
                </span>
              )}
              {deckStats.effects > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: typeStyles.EFFECT.bg, color: typeStyles.EFFECT.color, border: `1px solid ${typeStyles.EFFECT.border}` }}>
                  효과 {deckStats.effects}
                </span>
              )}
              {deckStats.terrains > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: typeStyles.TERRAIN.bg, color: typeStyles.TERRAIN.color, border: `1px solid ${typeStyles.TERRAIN.border}` }}>
                  지형 {deckStats.terrains}
                </span>
              )}
            </div>
          </div>

          {/* 덱 카드 목록 */}
          {selectedCards.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="font-card text-xs text-gray-500 text-center">
                왼쪽에서 카드를 클릭하여<br />덱에 추가하세요
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2">
              {/* 그룹화된 카드 리스트 */}
              <div className="space-y-1">
                {groupedCards.map(({ card, count, instances }) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg transition-all hover:bg-white/5 cursor-pointer group"
                    onClick={() => removeCard(instances[instances.length - 1])}
                    style={{
                      border: `1px solid ${typeStyles[card.type]?.border || '#444'}30`,
                    }}
                  >
                    {/* 미니 카드 아이콘 */}
                    <div
                      className="w-8 h-10 rounded flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(180deg, ${typeStyles[card.type]?.bg || '#333'} 0%, #0a0805 100%)`,
                        border: `1px solid ${typeStyles[card.type]?.border || '#444'}`,
                      }}
                    >
                      <span className="text-white text-xs font-bold">{card.cost}</span>
                    </div>

                    {/* 카드 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span
                          className="text-xs font-bold truncate"
                          style={{ color: typeStyles[card.type]?.color || '#fff' }}
                        >
                          {card.name}
                        </span>
                        {card.upgraded && (
                          <span className="text-green-400 text-[10px]">+</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500">{card.type}</span>
                    </div>

                    {/* 수량 */}
                    {count > 1 && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                        }}
                      >
                        ×{count}
                      </span>
                    )}

                    {/* 제거 버튼 */}
                    <span
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 text-sm"
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 적 선택 섹션 */}
          <div
            className="p-3 border-t-2 flex-1"
            style={{ borderColor: 'var(--gold-dark)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-title text-base" style={{ color: 'var(--gold-light)' }}>
                상대할 적
              </h2>
              <span className="text-xs text-gray-500">
                {selectedEnemies.length}/3
              </span>
            </div>

            {/* 적 그리드 */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              {ENEMY_OPTIONS.map((enemy, idx) => {
                const isSelected = selectedEnemies.includes(enemy.template);
                const typeColor = enemy.type === 'boss' ? '#dc2626'
                  : enemy.type === 'elite' ? '#a855f7'
                  : 'var(--gold)';
                const typeBg = enemy.type === 'boss' ? 'rgba(220, 38, 38, 0.15)'
                  : enemy.type === 'elite' ? 'rgba(168, 85, 247, 0.15)'
                  : 'rgba(212, 168, 75, 0.1)';

                return (
                  <button
                    key={idx}
                    onClick={() => toggleEnemy(enemy.template)}
                    className="p-2 rounded text-left transition-all text-xs hover:brightness-125"
                    style={{
                      background: isSelected ? typeBg : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${isSelected ? typeColor : '#555'}`,
                    }}
                  >
                    <div
                      className="font-title"
                      style={{ color: isSelected ? typeColor : '#ccc' }}
                    >
                      {enemy.label}
                    </div>
                    {enemy.type !== 'normal' && (
                      <span
                        className="text-[10px] px-1 rounded mt-0.5 inline-block"
                        style={{
                          background: typeBg,
                          color: typeColor,
                        }}
                      >
                        {enemy.type === 'elite' ? '엘리트' : '보스'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 선택된 적 표시 */}
            {selectedEnemies.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-800">
                {selectedEnemies.map((enemy, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[10px] rounded"
                    style={{
                      background: 'rgba(212, 168, 75, 0.2)',
                      color: 'var(--gold)',
                      border: '1px solid var(--gold-dark)',
                    }}
                  >
                    {enemy.name}
                  </span>
                ))}
              </div>
            )}

            {selectedEnemies.length === 0 && (
              <p className="text-[10px] text-gray-500 text-center py-1">
                선택 안하면 맵으로 진행
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
