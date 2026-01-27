import { create } from 'zustand';
import { PlayerStats, createInitialStats } from '../types/stats';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface StatsStore {
  stats: PlayerStats;
  unlockedAchievements: string[];
  isLoading: boolean;

  // 업적 알림용
  recentUnlockedAchievement: string | null;
  clearRecentAchievement: () => void;

  // 통계 업데이트 액션
  incrementKill: (type: 'mob' | 'elite' | 'boss') => void;
  incrementCardPlayed: (cardType: 'ATTACK' | 'SHIELD' | 'GADGET' | 'EFFECT' | 'TERRAIN') => void;
  addDamageDealt: (amount: number) => void;
  addDamageTaken: (amount: number) => void;
  addBlockGained: (amount: number) => void;
  addStrengthGained: (amount: number) => void;
  addHpLostByCard: (amount: number) => void;
  addHealing: (amount: number) => void;

  // 추가 통계 (업적용)
  addEnergyUsed: (amount: number) => void;
  updateMaxSingleDamage: (damage: number) => void;
  updateMaxBlockInTurn: (block: number) => void;
  updateMaxTurnInBattle: (turn: number) => void;
  updateMaxBlockedDamage: (blocked: number) => void;

  // 게임 진행
  recordGameStart: () => void;
  recordVictory: (floor: number) => void;
  recordDefeat: (floor: number) => void;
  updateHighestFloor: (floor: number) => void;

  // 업적
  unlockAchievement: (achievementId: string) => void;

  // SQL 동기화
  loadStats: () => Promise<void>;
  saveStats: () => Promise<void>;
  resetStats: () => void;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  stats: createInitialStats(),
  unlockedAchievements: [],
  isLoading: false,
  recentUnlockedAchievement: null,

  clearRecentAchievement: () => {
    set({ recentUnlockedAchievement: null });
  },

  // 적 처치 (전투 승리 시 한 번에 저장)
  incrementKill: (type) => {
    set((state) => {
      const newStats = { ...state.stats };
      newStats.totalKills += 1;
      if (type === 'mob') newStats.mobKills += 1;
      else if (type === 'elite') newStats.eliteKills += 1;
      else if (type === 'boss') newStats.bossKills += 1;
      newStats.lastUpdated = Date.now();
      return { stats: newStats };
    });
    // 저장은 전투 승리 시 한 번에 처리
  },

  // 카드 사용
  incrementCardPlayed: (cardType) => {
    set((state) => {
      const newStats = { ...state.stats };
      newStats.totalCardsPlayed += 1;
      switch (cardType) {
        case 'ATTACK': newStats.attackCardsPlayed += 1; break;
        case 'SHIELD': newStats.shieldCardsPlayed += 1; break;
        case 'GADGET': newStats.gadgetCardsPlayed += 1; break;
        case 'EFFECT': newStats.effectCardsPlayed += 1; break;
        case 'TERRAIN': newStats.terrainCardsPlayed += 1; break;
      }
      newStats.lastUpdated = Date.now();
      return { stats: newStats };
    });
  },

  // 데미지 입힘
  addDamageDealt: (amount) => {
    if (amount <= 0) return;
    set((state) => ({
      stats: {
        ...state.stats,
        totalDamageDealt: state.stats.totalDamageDealt + amount,
        lastUpdated: Date.now(),
      },
    }));
  },

  // 데미지 받음
  addDamageTaken: (amount) => {
    if (amount <= 0) return;
    set((state) => ({
      stats: {
        ...state.stats,
        totalDamageTaken: state.stats.totalDamageTaken + amount,
        lastUpdated: Date.now(),
      },
    }));
  },

  // 방어도 획득
  addBlockGained: (amount) => {
    if (amount <= 0) return;
    set((state) => ({
      stats: {
        ...state.stats,
        totalBlockGained: state.stats.totalBlockGained + amount,
        lastUpdated: Date.now(),
      },
    }));
  },

  // 힘 획득
  addStrengthGained: (amount) => {
    if (amount <= 0) return;
    set((state) => ({
      stats: {
        ...state.stats,
        totalStrengthGained: state.stats.totalStrengthGained + amount,
        lastUpdated: Date.now(),
      },
    }));
  },

  // 카드로 HP 손실
  addHpLostByCard: (amount) => {
    if (amount <= 0) return;
    set((state) => ({
      stats: {
        ...state.stats,
        totalHpLostByCards: state.stats.totalHpLostByCards + amount,
        lastUpdated: Date.now(),
      },
    }));
  },

  // 회복
  addHealing: (amount) => {
    if (amount <= 0) return;
    set((state) => ({
      stats: {
        ...state.stats,
        totalHealing: state.stats.totalHealing + amount,
        lastUpdated: Date.now(),
      },
    }));
  },

  // 에너지 사용
  addEnergyUsed: (amount) => {
    if (amount <= 0) return;
    set((state) => ({
      stats: {
        ...state.stats,
        totalEnergyUsed: state.stats.totalEnergyUsed + amount,
        lastUpdated: Date.now(),
      },
    }));
  },

  // 한 번에 입힌 최대 피해
  updateMaxSingleDamage: (damage) => {
    set((state) => {
      if (damage > state.stats.maxSingleDamage) {
        return {
          stats: {
            ...state.stats,
            maxSingleDamage: damage,
            lastUpdated: Date.now(),
          },
        };
      }
      return state;
    });
  },

  // 한 턴에 얻은 최대 방어도
  updateMaxBlockInTurn: (block) => {
    set((state) => {
      if (block > state.stats.maxBlockInTurn) {
        return {
          stats: {
            ...state.stats,
            maxBlockInTurn: block,
            lastUpdated: Date.now(),
          },
        };
      }
      return state;
    });
  },

  // 한 전투에서 최대 턴 수
  updateMaxTurnInBattle: (turn) => {
    set((state) => {
      if (turn > state.stats.maxTurnInBattle) {
        return {
          stats: {
            ...state.stats,
            maxTurnInBattle: turn,
            lastUpdated: Date.now(),
          },
        };
      }
      return state;
    });
  },

  // 한 번에 막은 최대 피해
  updateMaxBlockedDamage: (blocked) => {
    set((state) => {
      if (blocked > state.stats.maxBlockedDamage) {
        return {
          stats: {
            ...state.stats,
            maxBlockedDamage: blocked,
            lastUpdated: Date.now(),
          },
        };
      }
      return state;
    });
  },

  // 게임 시작
  recordGameStart: () => {
    set((state) => ({
      stats: {
        ...state.stats,
        totalGamesStarted: state.stats.totalGamesStarted + 1,
        lastUpdated: Date.now(),
      },
    }));
    get().saveStats();
  },

  // 승리
  recordVictory: (floor) => {
    set((state) => ({
      stats: {
        ...state.stats,
        totalVictories: state.stats.totalVictories + 1,
        highestFloorReached: Math.max(state.stats.highestFloorReached, floor),
        lastUpdated: Date.now(),
      },
    }));
    get().saveStats();
  },

  // 패배
  recordDefeat: (floor) => {
    set((state) => ({
      stats: {
        ...state.stats,
        totalDefeats: state.stats.totalDefeats + 1,
        highestFloorReached: Math.max(state.stats.highestFloorReached, floor),
        lastUpdated: Date.now(),
      },
    }));
    get().saveStats();
  },

  // 최고 층수 업데이트
  updateHighestFloor: (floor) => {
    set((state) => {
      if (floor > state.stats.highestFloorReached) {
        return {
          stats: {
            ...state.stats,
            highestFloorReached: floor,
            lastUpdated: Date.now(),
          },
        };
      }
      return state;
    });
  },

  // 업적 해금
  unlockAchievement: (achievementId) => {
    const { unlockedAchievements } = get();
    // 이미 달성한 업적이면 무시
    if (unlockedAchievements.includes(achievementId)) {
      return;
    }
    // 새 업적 달성
    set({
      unlockedAchievements: [...unlockedAchievements, achievementId],
      recentUnlockedAchievement: achievementId,
    });
    get().saveStats();
  },

  // SQL에서 통계 불러오기 (save_data JSONB 안에 저장)
  loadStats: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isGuest || !user) return;

    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from('game_saves')
        .select('save_data')
        .eq('user_id', user.uid)
        .single();

      if (error) {
        // 데이터가 없으면 초기값 사용
        if (error.code === 'PGRST116') {
          set({ isLoading: false });
          return;
        }
        console.error('통계 불러오기 실패:', error);
        set({ isLoading: false });
        return;
      }

      const saveData = data?.save_data;
      if (saveData?.player_stats) {
        set({
          stats: { ...createInitialStats(), ...saveData.player_stats },
          unlockedAchievements: saveData.achievements || [],
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('통계 불러오기 오류:', err);
      set({ isLoading: false });
    }
  },

  // SQL에 통계 저장 (save_data JSONB 안에 저장)
  saveStats: async () => {
    const { user, isGuest } = useAuthStore.getState();
    if (isGuest || !user) return;

    const { stats, unlockedAchievements } = get();

    try {
      // 기존 save_data 가져오기
      const { data: existingData } = await supabase
        .from('game_saves')
        .select('save_data')
        .eq('user_id', user.uid)
        .single();

      // 기존 save_data에 통계 추가
      const updatedSaveData = {
        ...(existingData?.save_data || {}),
        player_stats: stats,
        achievements: unlockedAchievements,
      };

      const { error } = await supabase
        .from('game_saves')
        .upsert({
          user_id: user.uid,
          save_data: updatedSaveData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('통계 저장 실패:', error);
      }
    } catch (err) {
      console.error('통계 저장 오류:', err);
    }
  },

  // 통계 초기화
  resetStats: () => {
    set({
      stats: createInitialStats(),
      unlockedAchievements: [],
    });
  },
}));

// 디바운스된 저장 함수 (빈번한 호출 방지)
let saveTimeout: NodeJS.Timeout | null = null;
const debouncedSave = () => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    useStatsStore.getState().saveStats();
  }, 2000); // 2초 디바운스
};

// 외부에서 사용할 디바운스 저장 함수
export const saveStatsDebounced = debouncedSave;
