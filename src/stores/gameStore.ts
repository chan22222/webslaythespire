import { create } from 'zustand';
import { Player, createInitialPlayer } from '../types/player';
import { GameMap, MapNode } from '../types/map';
import { Card, CardInstance, createCardInstance } from '../types/card';
import { Relic } from '../types/relic';
import { EnemyTemplate } from '../types/enemy';
import { createStarterDeck } from '../data/cards';
import { STARTER_RELICS } from '../data/relics';
import { generateMap } from '../utils/mapGenerator';
import { useAuthStore } from './authStore';

// 랜덤 시작 유물 선택
const getRandomStarterRelic = () => {
  const index = Math.floor(Math.random() * STARTER_RELICS.length);
  return [STARTER_RELICS[index]];
};

export type GamePhase = 'MAIN_MENU' | 'DECK_BUILDING' | 'MAP' | 'COMBAT' | 'REWARD' | 'SHOP' | 'REST' | 'EVENT' | 'CARD_REWARD' | 'GAME_OVER' | 'VICTORY';

const SAVE_KEY = 'shuffle_and_slash_save';

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

  // 저장/불러오기
  saveGame: () => void;
  loadGame: () => boolean;
  hasSaveData: () => boolean;
  deleteSaveData: () => void;
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
  addNextFloorNode: () => void;
  goToNextFloor: () => void;
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
    const relics = getRandomStarterRelic();
    const hasCrackedArmor = relics.some(r => r.id === 'cracked_armor');
    const initialPlayer = createInitialPlayer();

    set({
      phase: 'MAP',
      player: {
        ...initialPlayer,
        deck: starterDeck,
        relics,
        maxHp: hasCrackedArmor ? initialPlayer.maxHp + 15 : initialPlayer.maxHp,
        currentHp: hasCrackedArmor ? initialPlayer.currentHp + 15 : initialPlayer.currentHp,
      },
      map: newMap,
      currentAct: 1,
    });
    // 새 게임 시작 시 자동 저장
    setTimeout(() => get().saveGame(), 100);
  },

  startDeckBuilding: () => {
    const relics = getRandomStarterRelic();
    const hasCrackedArmor = relics.some(r => r.id === 'cracked_armor');
    const initialPlayer = createInitialPlayer();

    set({
      phase: 'DECK_BUILDING',
      player: {
        ...initialPlayer,
        deck: [],
        relics,
        maxHp: hasCrackedArmor ? initialPlayer.maxHp + 15 : initialPlayer.maxHp,
        currentHp: hasCrackedArmor ? initialPlayer.currentHp + 15 : initialPlayer.currentHp,
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
    setTimeout(() => get().saveGame(), 100);
  },

  setPhase: (phase: GamePhase) => {
    set({ phase });
    // MAP 화면 진입 시 자동 저장
    if (phase === 'MAP') {
      setTimeout(() => get().saveGame(), 100);
    }
    // 게임 오버 또는 승리 시 저장 데이터 삭제
    if (phase === 'GAME_OVER' || phase === 'VICTORY') {
      get().deleteSaveData();
    }
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
      case 'NEXT_FLOOR':
        // 다음 층으로 이동
        get().goToNextFloor();
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
    const { player, modifyMaxHp } = get();

    // 이미 가지고 있는 유물인지 확인
    if (player.relics.some(r => r.id === relic.id)) return;

    set({
      player: {
        ...player,
        relics: [...player.relics, relic],
      },
    });

    // PASSIVE 유물 효과 처리
    if (relic.id === 'cracked_armor') {
      modifyMaxHp(15);
    }
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
    const finalRelics = relics && relics.length > 0 ? relics : [...STARTER_RELICS];
    const hasCrackedArmor = finalRelics.some(r => r.id === 'cracked_armor');
    const initialPlayer = createInitialPlayer();

    set({
      phase: 'COMBAT',
      player: {
        ...initialPlayer,
        deck,
        relics: finalRelics,
        maxHp: hasCrackedArmor ? initialPlayer.maxHp + 15 : initialPlayer.maxHp,
        currentHp: hasCrackedArmor ? initialPlayer.currentHp + 15 : initialPlayer.currentHp,
      },
      testEnemies: enemies,
      map: { nodes: [], currentNodeId: null, floor: 1 },
    });
  },

  startGameWithDeckAndRelics: (relics: Relic[]) => {
    const { player } = get();
    const newMap = generateMap();
    const finalRelics = relics.length > 0 ? relics : [...STARTER_RELICS];
    const hasCrackedArmor = finalRelics.some(r => r.id === 'cracked_armor');
    const hadCrackedArmorBefore = player.relics.some(r => r.id === 'cracked_armor');

    // 새로 금간갑옷이 추가되는 경우만 HP 증가
    const hpBonus = hasCrackedArmor && !hadCrackedArmorBefore ? 15 : 0;

    set({
      phase: 'MAP',
      map: newMap,
      player: {
        ...player,
        relics: finalRelics,
        maxHp: player.maxHp + hpBonus,
        currentHp: player.currentHp + hpBonus,
      },
    });
    setTimeout(() => get().saveGame(), 100);
  },

  clearTestEnemies: () => {
    set({ testEnemies: null });
  },

  addNextFloorNode: () => {
    const { map } = get();

    // 현재 노드가 보스인지 확인
    const currentNode = map.nodes.find(n => n.id === map.currentNodeId);
    if (!currentNode || currentNode.type !== 'BOSS') return;

    // 이미 NEXT_FLOOR 노드가 있는지 확인
    const existingNextFloor = map.nodes.find(n => n.type === 'NEXT_FLOOR');
    if (existingNextFloor) return;

    // 보스 노드 뒤에 NEXT_FLOOR 노드 생성
    const nextFloorNode: MapNode = {
      id: `node-next-floor-${map.floor}`,
      type: 'NEXT_FLOOR',
      row: currentNode.row + 1,
      col: 0,
      connections: [],
      visited: false,
      x: currentNode.x + 120,
      y: currentNode.y,
    };

    // 보스 노드에 연결 추가
    const updatedNodes = map.nodes.map(n =>
      n.id === currentNode.id
        ? { ...n, connections: [...n.connections, nextFloorNode.id] }
        : n
    );

    set({
      map: {
        ...map,
        nodes: [...updatedNodes, nextFloorNode],
      },
    });
  },

  goToNextFloor: () => {
    const { map } = get();

    // 새 맵 생성
    const newMap = generateMap();

    set({
      phase: 'MAP',
      map: {
        ...newMap,
        floor: map.floor + 1,
      },
    });
    setTimeout(() => get().saveGame(), 100);
  },

  // 게임 저장 (게스트는 저장 안 함)
  saveGame: () => {
    const { isGuest } = useAuthStore.getState();
    if (isGuest) return;

    const { player, map, currentAct, playerName } = get();
    const saveData = {
      player,
      map,
      currentAct,
      playerName,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch (e) {
      console.error('게임 저장 실패:', e);
    }
  },

  // 게임 불러오기
  loadGame: () => {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (!savedData) return false;

      const { player, map, currentAct, playerName } = JSON.parse(savedData);
      set({
        phase: 'MAP',
        player,
        map,
        currentAct,
        playerName,
        testEnemies: null,
      });
      return true;
    } catch (e) {
      console.error('게임 불러오기 실패:', e);
      return false;
    }
  },

  // 저장 데이터 존재 여부 확인
  hasSaveData: () => {
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      return savedData !== null;
    } catch {
      return false;
    }
  },

  // 저장 데이터 삭제
  deleteSaveData: () => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.error('저장 데이터 삭제 실패:', e);
    }
  },
}));
