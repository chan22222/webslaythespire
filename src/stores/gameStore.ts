import { create } from 'zustand';
import { Player, createInitialPlayer } from '../types/player';
import { GameMap, MapNode } from '../types/map';
import { Card, CardInstance, createCardInstance } from '../types/card';
import { Relic } from '../types/relic';
import { EnemyTemplate } from '../types/enemy';
import { createStarterDeck } from '../data/cards';
import { BURNING_BLOOD } from '../data/relics';
import { generateMap } from '../utils/mapGenerator';

export type GamePhase = 'MAIN_MENU' | 'DECK_BUILDING' | 'MAP' | 'COMBAT' | 'REWARD' | 'SHOP' | 'REST' | 'EVENT' | 'CARD_REWARD' | 'GAME_OVER' | 'VICTORY';

interface GameState {
  // 게임 상태
  phase: GamePhase;
  player: Player;
  map: GameMap;
  currentAct: number;
  testEnemies: EnemyTemplate[] | null; // 테스트 모드용 적
  playerName: string; // 캐릭터 이름

  // 액션
  setPlayerName: (name: string) => void;
  startNewGame: () => void;
  startDeckBuilding: () => void;
  setDeck: (deck: CardInstance[]) => void;
  startGameWithDeck: () => void;
  setPhase: (phase: GamePhase) => void;
  moveToNode: (nodeId: string) => void;
  addCardToDeck: (card: Card) => void;
  removeCardFromDeck: (cardInstanceId: string) => void;
  addRelic: (relic: Relic) => void;
  modifyGold: (amount: number) => void;
  modifyHp: (amount: number) => void;
  modifyMaxHp: (amount: number) => void;
  healPlayer: (amount: number) => void;
  takeDamage: (amount: number) => void;
  upgradeCard: (cardInstanceId: string) => void;
  getCurrentNode: () => MapNode | null;
  getAvailableNodes: () => MapNode[];
  startTestBattle: (enemies: EnemyTemplate[], relics?: Relic[]) => void;
  startGameWithDeckAndRelics: (relics: Relic[]) => void;
  clearTestEnemies: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'MAIN_MENU',
  player: createInitialPlayer(),
  map: { nodes: [], currentNodeId: null, floor: 1 },
  currentAct: 1,
  testEnemies: null,
  playerName: '모험가',

  setPlayerName: (name: string) => {
    set({ playerName: name || '모험가' });
  },

  startNewGame: () => {
    const starterDeck = createStarterDeck().map(card => createCardInstance(card));
    const newMap = generateMap();

    set({
      phase: 'MAP',
      player: {
        ...createInitialPlayer(),
        deck: starterDeck,
        relics: [BURNING_BLOOD],
      },
      map: newMap,
      currentAct: 1,
    });
  },

  startDeckBuilding: () => {
    set({
      phase: 'DECK_BUILDING',
      player: {
        ...createInitialPlayer(),
        deck: [],
        relics: [BURNING_BLOOD],
      },
      map: { nodes: [], currentNodeId: null, floor: 1 },
      currentAct: 1,
    });
  },

  setDeck: (deck: CardInstance[]) => {
    const { player } = get();
    set({
      player: {
        ...player,
        deck,
      },
    });
  },

  startGameWithDeck: () => {
    const newMap = generateMap();
    set({
      phase: 'MAP',
      map: newMap,
    });
  },

  setPhase: (phase: GamePhase) => {
    set({ phase });
  },

  moveToNode: (nodeId: string) => {
    const { map } = get();
    const node = map.nodes.find(n => n.id === nodeId);

    if (!node) return;

    // 노드를 방문 처리
    const updatedNodes = map.nodes.map(n =>
      n.id === nodeId ? { ...n, visited: true } : n
    );

    set({
      map: {
        ...map,
        nodes: updatedNodes,
        currentNodeId: nodeId,
      },
    });

    // 노드 타입에 따라 페이즈 변경
    switch (node.type) {
      case 'ENEMY':
      case 'ELITE':
      case 'BOSS':
        set({ phase: 'COMBAT' });
        break;
      case 'REST':
        set({ phase: 'REST' });
        break;
      case 'SHOP':
        set({ phase: 'SHOP' });
        break;
      case 'EVENT':
        set({ phase: 'EVENT' });
        break;
      case 'TREASURE':
        set({ phase: 'REWARD' });
        break;
    }
  },

  addCardToDeck: (card: Card) => {
    const { player } = get();
    const cardInstance = createCardInstance(card);

    set({
      player: {
        ...player,
        deck: [...player.deck, cardInstance],
      },
    });
  },

  removeCardFromDeck: (cardInstanceId: string) => {
    const { player } = get();

    set({
      player: {
        ...player,
        deck: player.deck.filter(c => c.instanceId !== cardInstanceId),
      },
    });
  },

  addRelic: (relic: Relic) => {
    const { player } = get();

    // 이미 가지고 있는 유물인지 확인
    if (player.relics.some(r => r.id === relic.id)) return;

    set({
      player: {
        ...player,
        relics: [...player.relics, relic],
      },
    });
  },

  modifyGold: (amount: number) => {
    const { player } = get();

    set({
      player: {
        ...player,
        gold: Math.max(0, player.gold + amount),
      },
    });
  },

  modifyHp: (amount: number) => {
    const { player } = get();
    const newHp = Math.max(0, Math.min(player.maxHp, player.currentHp + amount));

    set({
      player: {
        ...player,
        currentHp: newHp,
      },
    });

    // 사망 체크는 CombatScreen에서 애니메이션 후 처리
  },

  healPlayer: (amount: number) => {
    const { player } = get();

    set({
      player: {
        ...player,
        currentHp: Math.min(player.maxHp, player.currentHp + amount),
      },
    });
  },

  takeDamage: (amount: number) => {
    const { player } = get();

    set({
      player: {
        ...player,
        currentHp: Math.max(0, player.currentHp - amount),
      },
    });
  },

  modifyMaxHp: (amount: number) => {
    const { player } = get();
    const newMaxHp = Math.max(1, player.maxHp + amount);
    // 최대 HP 증가 시 현재 HP도 같이 증가
    const newCurrentHp = amount > 0
      ? Math.min(newMaxHp, player.currentHp + amount)
      : Math.min(newMaxHp, player.currentHp);

    set({
      player: {
        ...player,
        maxHp: newMaxHp,
        currentHp: newCurrentHp,
      },
    });
  },

  upgradeCard: (cardInstanceId: string) => {
    const { player } = get();

    const updatedDeck = player.deck.map((card: CardInstance) => {
      if (card.instanceId === cardInstanceId && !card.upgraded && card.upgradeEffect) {
        return {
          ...card,
          ...card.upgradeEffect,
          upgraded: true,
        };
      }
      return card;
    });

    set({
      player: {
        ...player,
        deck: updatedDeck,
      },
    });
  },

  getCurrentNode: () => {
    const { map } = get();
    if (!map.currentNodeId) return null;
    return map.nodes.find(n => n.id === map.currentNodeId) || null;
  },

  getAvailableNodes: () => {
    const { map } = get();

    // 아직 시작 전이면 첫 번째 행의 모든 노드
    if (!map.currentNodeId) {
      return map.nodes.filter(n => n.row === 0);
    }

    // 현재 노드에서 연결된 노드들
    const currentNode = map.nodes.find(n => n.id === map.currentNodeId);
    if (!currentNode) return [];

    return map.nodes.filter(n => currentNode.connections.includes(n.id));
  },

  startTestBattle: (enemies: EnemyTemplate[], relics?: Relic[]) => {
    const { player } = get();
    // 현재 덱이 있으면 유지, 없으면 스타터 덱 사용
    const deck = player.deck.length > 0
      ? player.deck
      : createStarterDeck().map(card => createCardInstance(card));

    set({
      phase: 'COMBAT',
      player: {
        ...createInitialPlayer(),
        deck,
        relics: relics && relics.length > 0 ? relics : [BURNING_BLOOD],
      },
      testEnemies: enemies,
      map: { nodes: [], currentNodeId: null, floor: 1 },
    });
  },

  startGameWithDeckAndRelics: (relics: Relic[]) => {
    const { player } = get();
    const newMap = generateMap();
    set({
      phase: 'MAP',
      map: newMap,
      player: {
        ...player,
        relics: relics.length > 0 ? relics : [BURNING_BLOOD],
      },
    });
  },

  clearTestEnemies: () => {
    set({ testEnemies: null });
  },
}));
