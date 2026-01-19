import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, googleProvider, githubProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  type User,
  type AuthError,
} from 'firebase/auth';

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  showLoginScreen: boolean;
  authError: string | null;

  // Actions
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  playAsGuest: () => void;
  setShowLoginScreen: (show: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isGuest: false,
      isLoading: false,
      isInitialized: false,
      showLoginScreen: true,
      authError: null,

      initialize: async () => {
        try {
          set({ isLoading: true });

          // 인증 상태 변경 리스너
          onAuthStateChanged(auth, (user) => {
            if (user) {
              set({
                user,
                isGuest: false,
                showLoginScreen: false,
              });
            } else {
              set({
                user: null,
                isGuest: get().isGuest,
                showLoginScreen: !get().isGuest,
              });
            }
          });
        } catch (error) {
          // Firebase가 설정되지 않은 경우
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      signInWithGoogle: async () => {
        set({ isLoading: true, authError: null });
        try {
          const result = await signInWithPopup(auth, googleProvider);
          set({
            user: result.user,
            isGuest: false,
            showLoginScreen: false,
            isLoading: false,
          });
        } catch (error: unknown) {
          const authError = error as AuthError;

          if (authError.code === 'auth/account-exists-with-different-credential') {
            const email = authError.customData?.email as string;
            if (email) {
              const methods = await fetchSignInMethodsForEmail(auth, email);
              if (methods.includes('github.com')) {
                set({
                  authError: '이 이메일은 GitHub 계정으로 가입되어 있습니다. GitHub로 로그인해주세요.',
                  isLoading: false
                });
              } else if (methods.includes('password')) {
                set({
                  authError: '이 이메일은 이메일/비밀번호로 가입되어 있습니다. 이메일로 로그인해주세요.',
                  isLoading: false
                });
              } else {
                set({ authError: '이 이메일은 다른 방법으로 이미 가입되어 있습니다.', isLoading: false });
              }
              return;
            }
          }

          const errorMessage = error instanceof Error ? error.message : '구글 로그인 중 오류가 발생했습니다';
          set({ authError: errorMessage, isLoading: false });
        }
      },

      signInWithGithub: async () => {
        set({ isLoading: true, authError: null });
        try {
          const result = await signInWithPopup(auth, githubProvider);
          set({
            user: result.user,
            isGuest: false,
            showLoginScreen: false,
            isLoading: false,
          });
        } catch (error: unknown) {
          const authError = error as AuthError;

          // 같은 이메일로 다른 방법으로 이미 가입된 경우
          if (authError.code === 'auth/account-exists-with-different-credential') {
            const email = authError.customData?.email as string;
            if (email) {
              const methods = await fetchSignInMethodsForEmail(auth, email);
              if (methods.includes('google.com')) {
                set({
                  authError: '이 이메일은 Google 계정으로 가입되어 있습니다. Google로 로그인해주세요.',
                  isLoading: false
                });
              } else if (methods.includes('password')) {
                set({
                  authError: '이 이메일은 이메일/비밀번호로 가입되어 있습니다. 이메일로 로그인해주세요.',
                  isLoading: false
                });
              } else {
                set({ authError: '이 이메일은 다른 방법으로 이미 가입되어 있습니다.', isLoading: false });
              }
              return;
            }
          }

          const errorMessage = error instanceof Error ? error.message : 'GitHub 로그인 중 오류가 발생했습니다';
          set({ authError: errorMessage, isLoading: false });
        }
      },

      signInWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, authError: null });
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          set({
            user: result.user,
            isGuest: false,
            showLoginScreen: false,
            isLoading: false,
          });
          return true;
        } catch (error: unknown) {
          let errorMessage = '로그인 중 오류가 발생했습니다';
          if (error instanceof Error) {
            if (error.message.includes('user-not-found')) {
              errorMessage = '등록되지 않은 이메일입니다';
            } else if (error.message.includes('wrong-password')) {
              errorMessage = '비밀번호가 올바르지 않습니다';
            } else if (error.message.includes('invalid-email')) {
              errorMessage = '올바른 이메일 형식이 아닙니다';
            } else if (error.message.includes('invalid-credential')) {
              errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다';
            }
          }
          set({ authError: errorMessage, isLoading: false });
          return false;
        }
      },

      signUp: async (email: string, password: string) => {
        set({ isLoading: true, authError: null });
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          set({
            user: result.user,
            isGuest: false,
            showLoginScreen: false,
            isLoading: false,
          });
          return true;
        } catch (error: unknown) {
          let errorMessage = '회원가입 중 오류가 발생했습니다';
          if (error instanceof Error) {
            if (error.message.includes('email-already-in-use')) {
              errorMessage = '이미 사용 중인 이메일입니다';
            } else if (error.message.includes('invalid-email')) {
              errorMessage = '올바른 이메일 형식이 아닙니다';
            } else if (error.message.includes('weak-password')) {
              errorMessage = '비밀번호가 너무 약합니다';
            }
          }
          set({ authError: errorMessage, isLoading: false });
          return false;
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        try {
          await firebaseSignOut(auth);
          set({
            user: null,
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
          isGuest: true,
          showLoginScreen: false,
        });
      },

      setShowLoginScreen: (show) => {
        set({ showLoginScreen: show });
      },

      clearError: () => {
        set({ authError: null });
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
