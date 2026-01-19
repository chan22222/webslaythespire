import { useAuthStore } from '../../stores/authStore';

export function LoginScreen() {
  const { signInWithGoogle, signInWithGithub, playAsGuest, isLoading } = useAuthStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #15121a 0%, #0a0a10 50%, #000 100%)',
        }}
      />

      {/* 콘텐츠 */}
      <div
        className="relative z-10 p-8 rounded-lg border-2 max-w-md w-full mx-4"
        style={{
          background: 'linear-gradient(180deg, rgba(30, 25, 20, 0.95) 0%, rgba(15, 12, 10, 0.98) 100%)',
          borderColor: 'var(--gold-dark)',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 168, 75, 0.1)',
        }}
      >
        {/* 타이틀 */}
        <h1
          className="text-center mb-2"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '1.5rem',
            background: 'linear-gradient(175deg, #fff4d0 0%, #ffd860 15%, #ffca28 35%, #e5a820 55%, #c48c18 75%, #a06a10 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 6px rgba(255, 200, 48, 0.4)) drop-shadow(2px 2px 0 #3d2a08)',
          }}
        >
          SHUFFLE
        </h1>
        <h1
          className="text-center mb-6"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '1.5rem',
            background: 'linear-gradient(175deg, #fff4d0 0%, #ffd860 15%, #ffca28 35%, #e5a820 55%, #c48c18 75%, #a06a10 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 6px rgba(255, 200, 48, 0.4)) drop-shadow(2px 2px 0 #3d2a08)',
          }}
        >
          & SLASH
        </h1>

        {/* 구분선 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[var(--gold-dark)] to-[var(--gold-dark)]" />
          <div className="w-2 h-2 rotate-45 bg-[var(--gold-dark)]" />
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent via-[var(--gold-dark)] to-[var(--gold-dark)]" />
        </div>

        {/* 로그인 버튼들 */}
        <div className="space-y-3">
          {/* Google 로그인 */}
          <button
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(180deg, #4285f4 0%, #3367d6 100%)',
              border: '2px solid #5a9af8',
              boxShadow: '0 4px 15px rgba(66, 133, 244, 0.3)',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span
              className="text-white font-bold"
              style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive' }}
            >
              Google로 로그인
            </span>
          </button>

          {/* Github 로그인 */}
          <button
            onClick={signInWithGithub}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(180deg, #333 0%, #1a1a1a 100%)',
              border: '2px solid #555',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span
              className="text-white font-bold"
              style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive' }}
            >
              Github로 로그인
            </span>
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[var(--gold-dark)]" style={{ opacity: 0.3 }} />
            <span
              className="text-xs"
              style={{
                fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                color: 'var(--gold-dark)',
              }}
            >
              또는
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[var(--gold-dark)]" style={{ opacity: 0.3 }} />
          </div>

          {/* 게스트 플레이 */}
          <button
            onClick={playAsGuest}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(180deg, #2a2520 0%, #1a1510 100%)',
              border: '2px solid var(--gold-dark)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span
              style={{
                fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                color: 'var(--gold-light)',
              }}
            >
              게스트로 플레이
            </span>
          </button>
        </div>

        {/* 안내 텍스트 */}
        <p
          className="text-center mt-6 text-xs opacity-60"
          style={{
            fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
            color: 'var(--gold-dark)',
          }}
        >
          로그인하면 진행 상황이 저장됩니다
        </p>
      </div>
    </div>
  );
}
