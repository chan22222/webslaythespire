import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  showLoginScreen: boolean;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  playAsGuest: () => void;
  setShowLoginScreen: (show: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isGuest: false,
      isLoading: false,
      isInitialized: false,
      showLoginScreen: true,

      initialize: async () => {
        try {
          set({ isLoading: true });

          // 현재 세션 확인
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            set({
              user: session.user,
              session,
              isGuest: false,
              showLoginScreen: false,
            });
          }

          // 인증 상태 변경 리스너
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              user: session?.user ?? null,
              session,
              isGuest: session ? false : get().isGuest,
              showLoginScreen: !session && !get().isGuest,
            });
          });
        } catch (error) {
          // Supabase가 설정되지 않은 경우 (URL이 없는 경우)
          // 그냥 넘어감
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin,
            },
          });
          if (error) throw error;
        } catch (error) {
          set({ isLoading: false });
        }
      },

      signInWithGithub: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              redirectTo: window.location.origin,
            },
          });
          if (error) throw error;
        } catch (error) {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await supabase.auth.signOut();
          set({
            user: null,
            session: null,
            isGuest: false,
            showLoginScreen: true,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      playAsGuest: () => {
        set({
          user: null,
          session: null,
          isGuest: true,
          showLoginScreen: false,
        });
      },

      setShowLoginScreen: (show) => {
        set({ showLoginScreen: show });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isGuest: state.isGuest,
        showLoginScreen: state.showLoginScreen,
      }),
    }
  )
);
