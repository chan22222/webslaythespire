import { create } from 'zustand';
import { Player, createInitialPlayer } from '../types/player';
import { GameMap, MapNode } from '../types/map';
import { Card, CardInstance, createCardInstance } from '../types/card';
import { Relic } from '../types/relic';
import { EnemyTemplate } from '../types/enemy';
import { createStarterDeck, STRIKE, DEFEND, BASH } from '../data/cards';
import { RELAX, FLEXIBLE_RESPONSE } from '../data/cards/starterCards';
import { STARTER_RELICS, ALL_RELICS } from '../data/relics';
import { generateMap } from '../utils/mapGenerator';
import { useAuthStore } from './authStore';
import { supabase } from '../lib/supabase';

// 랜덤 시작 유물 선택
const getRandomStarterRelic = () => {
  const index = Math.floor(Math.random() * STARTER_RELICS.length);
  return [STARTER_RELICS[index]];
};

export type GamePhase = 'MAIN_MENU' | 'DECK_BUILDING' | 'NEW_GAME_DECK_BUILDING' | 'MAP' | 'COMBAT' | 'REWARD' | 'SHOP' | 'REST' | 'EVENT' | 'CARD_REWARD' | 'GAME_OVER' | 'VICTORY';

interface GameState {
  // 게임 상태
  phase: GamePhase;
  player: Player;
  map: GameMap;
  currentAct: number;
  testEnemies: EnemyTemplate[] | null; // 테스트 모드용 적
  playerName: string; // 캐릭터 이름
  deserterCount: number; // 전투 중 탈주 횟수
  ownedCardIds: string[]; // 보유한 카드 ID 목록
  ownedRelicIds: string[]; // 보유한 유물 ID 목록

  // 액션
  setPlayerName: (name: string) => void;
  startNewGame: () => void;

  // 저장/불러오기
  hasSaveData: boolean;
  isSaveLoading: boolean;
  saveGame: () => Promise<void>;
  loadGame: () => Promise<boolean>;
  checkSaveData: () => Promise<void>;
  deleteSaveData: () => Promise<void>;
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
  incrementDeserterCount: () => Promise<void>;
  decrementDeserterCount: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'MAIN_MENU',
  player: createInitialPlayer(),
  map: { nodes: [], currentNodeId: null, floor: 1 },
  currentAct: 1,
  testEnemies: null,
  playerName: '모험가',
  deserterCount: 0,
  hasSaveData: false,
  isSaveLoading: false,
  ownedCardIds: [
    // 스타터 카드
    'strike', 'defend', 'bash', 'relax', 'flexible_response',
    // 커먼 카드 (자동 해금)
    'combo_attack', 'assault_shield', 'double_strike', 'equipment_check', 'neutralize', 'instant_focus', 'tactical_review',
    // 언커먼 카드 (자동 해금)
    'rage', 'diamond_body', 'life_exchange', 'desperate_strike', 'fatal_wound', 'battle_trance', 'sweeping', 'wild_mushroom',
  ], // 레어/유니크는 조건 달성 시 해금
  ownedRelicIds: ['burning_blood', 'ring_of_the_snake', 'cracked_armor'], // 스타터 유물만 보유

  setPlayerName: (name: string) => {
    set({ playerName: name || '모험가' });
  },

  startNewGame: () => {
    const initialPlayer = createInitialPlayer();
    const { isGuest } = useAuthStore.getState();

    // 게스트는 바로 맵으로 이동 (스타터 덱 + 랜덤 스타터 유물)
    if (isGuest) {
      const starterRelic = STARTER_RELICS[Math.floor(Math.random() * STARTER_RELICS.length)];
      const hasCrackedArmor = starterRelic.id === 'cracked_armor';
      const newMap = generateMap();
      // 스타터 카드 2장씩 생성
      const starterCards = [STRIKE, DEFEND, BASH, RELAX, FLEXIBLE_RESPONSE];
      const starterDeck = starterCards.flatMap(card => [
        createCardInstance(card),
        createCardInstance(card),
      ]);

      set({
        phase: 'MAP',
        player: {
          ...initialPlayer,
          deck: starterDeck,
          relics: [starterRelic],
          maxHp: hasCrackedArmor ? initialPlayer.maxHp + 15 : initialPlayer.maxHp,
          currentHp: hasCrackedArmor ? initialPlayer.currentHp + 15 : initialPlayer.currentHp,
        },
        ownedCardIds: [
          'strike', 'defend', 'bash', 'relax', 'flexible_response',
          'combo_attack', 'assault_shield', 'double_strike', 'equipment_check', 'neutralize', 'instant_focus', 'tactical_review',
          'rage', 'diamond_body', 'life_exchange', 'desperate_strike', 'fatal_wound', 'battle_trance', 'sweeping', 'wild_mushroom',
        ],
        map: newMap,
        currentAct: 1,
        testEnemies: null,
      });
      return;
    }

    // 로그인 유저도 바로 맵으로 이동
    const starterRelic = STARTER_RELICS[Math.floor(Math.random() * STARTER_RELICS.length)];
    const hasCrackedArmor = starterRelic.id === 'cracked_armor';
    const newMap = generateMap();
    const starterCards = [STRIKE, DEFEND, BASH, RELAX, FLEXIBLE_RESPONSE];
    const starterDeck = starterCards.flatMap(card => [
      createCardInstance(card),
      createCardInstance(card),
    ]);

    set({
      phase: 'MAP',
      player: {
        ...initialPlayer,
        deck: starterDeck,
        relics: [starterRelic],
        maxHp: hasCrackedArmor ? initialPlayer.maxHp + 15 : initialPlayer.maxHp,
        currentHp: hasCrackedArmor ? initialPlayer.currentHp + 15 : initialPlayer.currentHp,
      },
      ownedCardIds: [
        'strike', 'defend', 'bash', 'relax', 'flexible_response',
        'combo_attack', 'assault_shield', 'double_strike', 'equipment_check', 'neutralize', 'instant_focus', 'tactical_review',
        'rage', 'diamond_body', 'life_exchange', 'desperate_strike', 'fatal_wound', 'battle_trance', 'sweeping', 'wild_mushroom',
      ],
      map: newMap,
      currentAct: 1,
      testEnemies: null,
    });
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
      testEnemies: null, // 연습 모드 적 초기화
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
        get().incrementDeserterCount(); // 전투 시작 시 탈주 카운트 증가
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

  // 저장 데이터 존재 여부 확인 (Supabase)
  checkSaveData: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isGuest || !user) {
      set({ hasSaveData: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_saves')
        .select('id')
        .eq('user_id', user.uid)
        .single();

      set({ hasSaveData: !error && !!data });
    } catch {
      set({ hasSaveData: false });
    }
  },

  // 게임 저장 (Supabase)
  saveGame: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isGuest || !user) return;

    const { player, map, currentAct, playerName, phase } = get();
    const saveData = {
      player,
      map,
      currentAct,
      phase, // 현재 phase도 저장 (전투 중 탈주 감지용)
      savedAt: Date.now(),
    };

    try {
      const { error } = await supabase
        .from('game_saves')
        .upsert({
          user_id: user.uid,
          player_name: playerName,
          save_data: saveData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('게임 저장 실패:', error);
      } else {
        set({ hasSaveData: true });
      }
    } catch (e) {
      console.error('게임 저장 실패:', e);
    }
  },

  // 게임 불러오기 (Supabase)
  loadGame: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isGuest || !user) return false;

    set({ isSaveLoading: true });

    try {
      const { data, error } = await supabase
        .from('game_saves')
        .select('save_data, player_name, deserter_count')
        .eq('user_id', user.uid)
        .single();

      if (error || !data) {
        set({ isSaveLoading: false });
        return false;
      }

      const { player, map, currentAct } = data.save_data;
      const deserterCount = data.deserter_count || 0;

      // 탈주 3회 이상이면 이름을 "상습 탈주자"로 변경
      const loadedPlayerName = deserterCount >= 3 ? '상습 탈주자' : (data.player_name || '모험가');

      // 유물 복원: 저장된 유물 id를 기반으로 원본 유물 데이터(함수 포함) 복원
      const restoredRelics = player.relics.map((savedRelic: Relic) => {
        const originalRelic = ALL_RELICS.find(r => r.id === savedRelic.id);
        return originalRelic || savedRelic;
      });

      set({
        phase: 'MAP',
        player: {
          ...player,
          relics: restoredRelics,
        },
        map,
        currentAct,
        playerName: loadedPlayerName,
        deserterCount,
        testEnemies: null,
        isSaveLoading: false,
      });
      return true;
    } catch (e) {
      console.error('게임 불러오기 실패:', e);
      set({ isSaveLoading: false });
      return false;
    }
  },

  // 저장 데이터 삭제 (Supabase)
  deleteSaveData: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isGuest || !user) return;

    try {
      await supabase
        .from('game_saves')
        .delete()
        .eq('user_id', user.uid);

      set({ hasSaveData: false });
    } catch (e) {
      console.error('저장 데이터 삭제 실패:', e);
    }
  },

  // 전투 시작 시 탈주 카운트 증가
  incrementDeserterCount: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isGuest || !user) return;

    const { deserterCount } = get();
    const newCount = deserterCount + 1;
    set({ deserterCount: newCount });

    try {
      await supabase
        .from('game_saves')
        .update({ deserter_count: newCount })
        .eq('user_id', user.uid);
    } catch (e) {
      console.error('탈주 카운트 증가 실패:', e);
    }
  },

  // 전투 승리 시 탈주 카운트 감소
  decrementDeserterCount: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isGuest || !user) return;

    const { deserterCount } = get();
    const newCount = Math.max(0, deserterCount - 1);
    set({ deserterCount: newCount });

    try {
      await supabase
        .from('game_saves')
        .update({ deserter_count: newCount })
        .eq('user_id', user.uid);
    } catch (e) {
      console.error('탈주 카운트 감소 실패:', e);
    }
  },
}));
