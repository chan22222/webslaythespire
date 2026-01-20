import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

type AuthMode = 'select' | 'login' | 'signup';

export function LoginScreen() {
  const { signInWithEmail, signUp, signInWithGoogle, signInWithGithub, playAsGuest, isLoading, authError, clearError } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('비밀번호가 일치하지 않습니다');
        return;
      }
      if (password.length < 6) {
        setLocalError('비밀번호는 6자 이상이어야 합니다');
        return;
      }
      await signUp(email, password);
    } else {
      await signInWithEmail(email, password);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLocalError('');
    clearError();
  };

  const displayError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #15121a 0%, #0a0a10 50%, #000 100%)',
        }}
      />

      {/* 콘텐츠 - landscape에서 더 넓게 */}
      <div
        className="relative z-10 p-4 sm:p-8 [@media(max-height:500px)]:px-8 [@media(max-height:500px)]:py-5 rounded-lg border-2 max-w-md [@media(max-height:500px)]:max-w-4xl w-full mx-4"
        style={{
          background: 'linear-gradient(180deg, rgba(30, 25, 20, 0.95) 0%, rgba(15, 12, 10, 0.98) 100%)',
          borderColor: 'var(--gold-dark)',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 168, 75, 0.1)',
        }}
      >
        {/* 타이틀 - landscape에서 한 줄로 */}
        <div className="[@media(max-height:500px)]:flex [@media(max-height:500px)]:items-center [@media(max-height:500px)]:justify-center [@media(max-height:500px)]:gap-3 [@media(max-height:500px)]:mb-4">
          <h1
            className="text-center mb-1 sm:mb-2 [@media(max-height:500px)]:mb-0 text-base sm:text-2xl [@media(max-height:500px)]:text-xl"
            style={{
              fontFamily: '"Press Start 2P", monospace',
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
            className="text-center mb-3 sm:mb-6 [@media(max-height:500px)]:mb-0 text-base sm:text-2xl [@media(max-height:500px)]:text-xl"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              background: 'linear-gradient(175deg, #fff4d0 0%, #ffd860 15%, #ffca28 35%, #e5a820 55%, #c48c18 75%, #a06a10 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 6px rgba(255, 200, 48, 0.4)) drop-shadow(2px 2px 0 #3d2a08)',
            }}
          >
            & SLASH
          </h1>
        </div>

        {/* 구분선 - landscape에서 숨김 */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-6 [@media(max-height:500px)]:hidden">
          <div className="h-[1px] w-10 sm:w-16 bg-gradient-to-r from-transparent via-[var(--gold-dark)] to-[var(--gold-dark)]" />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 bg-[var(--gold-dark)]" />
          <div className="h-[1px] w-10 sm:w-16 bg-gradient-to-l from-transparent via-[var(--gold-dark)] to-[var(--gold-dark)]" />
        </div>

        {mode === 'select' ? (
          /* 선택 화면 - landscape에서 그리드 */
          <div className="space-y-2 sm:space-y-3 [@media(max-height:500px)]:space-y-0 [@media(max-height:500px)]:grid [@media(max-height:500px)]:grid-cols-3 [@media(max-height:500px)]:gap-6">
            {/* 왼쪽 열: 로그인/회원가입 */}
            <div className="[@media(max-height:500px)]:space-y-2.5">
              {/* landscape용 라벨 */}
              <p className="hidden [@media(max-height:500px)]:block text-center text-xs mb-1 opacity-70" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold-dark)' }}>
                이메일 로그인
              </p>
              {/* 로그인 버튼 */}
              <button
                onClick={() => switchMode('login')}
                disabled={isLoading}
                className="w-full py-2 sm:py-3 [@media(max-height:500px)]:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(180deg, #3a5030 0%, #1a2510 100%)',
                  border: '2px solid #5a8040',
                }}
              >
                <span className="text-sm sm:text-base [@media(max-height:500px)]:text-sm" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: '#a0d080' }}>
                  로그인
                </span>
              </button>

              {/* 회원가입 버튼 */}
              <button
                onClick={() => switchMode('signup')}
                disabled={isLoading}
                className="w-full py-2 sm:py-3 [@media(max-height:500px)]:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50 [@media(min-height:501px)]:mt-2"
                style={{
                  background: 'linear-gradient(180deg, #304a5a 0%, #102030 100%)',
                  border: '2px solid #4080a0',
                }}
              >
                <span className="text-sm sm:text-base [@media(max-height:500px)]:text-sm" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: '#80c0e0' }}>
                  회원가입
                </span>
              </button>
            </div>

            {/* 소셜 로그인 구분선 - portrait에서만 표시 */}
            <div className="flex items-center gap-2 sm:gap-4 my-2 sm:my-4 [@media(max-height:500px)]:hidden">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[var(--gold-dark)]" style={{ opacity: 0.3 }} />
              <span className="text-[0.65rem] sm:text-xs whitespace-nowrap" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold-dark)' }}>
                소셜 로그인
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[var(--gold-dark)]" style={{ opacity: 0.3 }} />
            </div>

            {/* 중간 열: 소셜 로그인 */}
            <div className="[@media(max-height:500px)]:space-y-2.5">
              {/* landscape용 라벨 */}
              <p className="hidden [@media(max-height:500px)]:block text-center text-xs mb-1 opacity-70" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold-dark)' }}>
                소셜 로그인
              </p>
              {/* 구글 로그인 */}
              <button
                onClick={signInWithGoogle}
                disabled={isLoading}
                className="w-full py-2 sm:py-3 [@media(max-height:500px)]:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(180deg, #4a4540 0%, #2a2520 100%)',
                  border: '2px solid #6a6560',
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm sm:text-base [@media(max-height:500px)]:text-sm" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: '#d0ccc0' }}>
                  Google
                </span>
              </button>

              {/* GitHub 로그인 */}
              <button
                onClick={signInWithGithub}
                disabled={isLoading}
                className="w-full py-2 sm:py-3 [@media(max-height:500px)]:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50 [@media(min-height:501px)]:mt-2"
                style={{
                  background: 'linear-gradient(180deg, #3a3a3a 0%, #1a1a1a 100%)',
                  border: '2px solid #505050',
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm sm:text-base [@media(max-height:500px)]:text-sm" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: '#d0d0d0' }}>
                  GitHub
                </span>
              </button>
            </div>

            {/* 구분선 - portrait에서만 표시 */}
            <div className="flex items-center gap-2 sm:gap-4 my-2 sm:my-4 [@media(max-height:500px)]:hidden">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[var(--gold-dark)]" style={{ opacity: 0.3 }} />
              <span className="text-[0.65rem] sm:text-xs" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold-dark)' }}>
                또는
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[var(--gold-dark)]" style={{ opacity: 0.3 }} />
            </div>

            {/* 오른쪽 열: 게스트 플레이 */}
            <div className="[@media(max-height:500px)]:flex [@media(max-height:500px)]:flex-col [@media(max-height:500px)]:justify-center">
              {/* landscape용 라벨 */}
              <p className="hidden [@media(max-height:500px)]:block text-center text-xs mb-1 opacity-70" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold-dark)' }}>
                또는
              </p>
              {/* 게스트 플레이 */}
              <button
                onClick={playAsGuest}
                disabled={isLoading}
                className="w-full py-2 sm:py-3 [@media(max-height:500px)]:py-3 px-3 sm:px-4 rounded-lg flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(180deg, #2a2520 0%, #1a1510 100%)',
                  border: '2px solid var(--gold-dark)',
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 [@media(max-height:500px)]:w-4 [@media(max-height:500px)]:h-4" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="text-sm sm:text-base [@media(max-height:500px)]:text-sm" style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold-light)' }}>
                  게스트
                </span>
              </button>

              {/* 안내 텍스트 */}
              <p
                className="text-center mt-2 [@media(max-height:500px)]:mt-1.5 text-xs sm:text-sm opacity-70 [@media(max-height:500px)]:text-xs"
                style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold-dark)' }}
              >
                게스트의 데이터는 저장되지 않습니다
              </p>
            </div>

            {/* 에러 메시지 */}
            {authError && (
              <p
                className="text-center text-xs py-2 px-3 rounded [@media(max-height:500px)]:col-span-3 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-[0.65rem]"
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                  color: '#ff8080',
                  background: 'rgba(255, 80, 80, 0.1)',
                  border: '1px solid rgba(255, 80, 80, 0.3)',
                }}
              >
                {authError}
              </p>
            )}
          </div>
        ) : (
          /* 로그인/회원가입 폼 - landscape에서 2열 */
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 [@media(max-height:500px)]:space-y-0 [@media(max-height:500px)]:grid [@media(max-height:500px)]:grid-cols-2 [@media(max-height:500px)]:gap-6">
            <h2
              className="text-center mb-3 sm:mb-4 [@media(max-height:500px)]:col-span-2 [@media(max-height:500px)]:mb-1 text-base sm:text-lg [@media(max-height:500px)]:text-sm"
              style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold-light)' }}
            >
              {mode === 'login' ? '로그인' : '회원가입'}
            </h2>

            {/* 이메일 */}
            <div>
              <label
                className="block mb-1 text-[0.65rem] sm:text-xs [@media(max-height:500px)]:text-[0.6rem]"
                style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold)' }}
              >
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 [@media(max-height:500px)]:py-2 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--gold-dark)] text-sm sm:text-base [@media(max-height:500px)]:text-sm"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--gold-dark)',
                  color: 'var(--gold-light)',
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                }}
                placeholder="example@email.com"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label
                className="block mb-1 text-[0.65rem] sm:text-xs [@media(max-height:500px)]:text-[0.6rem]"
                style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold)' }}
              >
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 [@media(max-height:500px)]:py-2 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--gold-dark)] text-sm sm:text-base [@media(max-height:500px)]:text-sm"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--gold-dark)',
                  color: 'var(--gold-light)',
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                }}
                placeholder="******"
              />
            </div>

            {/* 비밀번호 확인 (회원가입시만) */}
            {mode === 'signup' && (
              <div className="[@media(max-height:500px)]:col-span-2">
                <label
                  className="block mb-1 text-[0.65rem] sm:text-xs [@media(max-height:500px)]:text-[0.6rem]"
                  style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold)' }}
                >
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 [@media(max-height:500px)]:py-2 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--gold-dark)] text-sm sm:text-base [@media(max-height:500px)]:text-sm"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--gold-dark)',
                    color: 'var(--gold-light)',
                    fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                  }}
                  placeholder="******"
                />
              </div>
            )}

            {/* 에러 메시지 */}
            {displayError && (
              <p
                className="text-center text-xs py-2 px-3 rounded [@media(max-height:500px)]:col-span-2 [@media(max-height:500px)]:py-2 [@media(max-height:500px)]:text-[0.65rem]"
                style={{
                  fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                  color: '#ff8080',
                  background: 'rgba(255, 80, 80, 0.1)',
                  border: '1px solid rgba(255, 80, 80, 0.3)',
                }}
              >
                {displayError}
              </p>
            )}

            {/* 버튼 그룹 - landscape에서 가로 배치 */}
            <div className="[@media(max-height:500px)]:col-span-2 [@media(max-height:500px)]:flex [@media(max-height:500px)]:gap-6">
              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 sm:py-3 [@media(max-height:500px)]:py-3 px-3 sm:px-4 rounded-lg transition-all hover:scale-105 hover:brightness-110 disabled:opacity-50 [@media(max-height:500px)]:flex-1"
                style={{
                  background: mode === 'login'
                    ? 'linear-gradient(180deg, #3a5030 0%, #1a2510 100%)'
                    : 'linear-gradient(180deg, #304a5a 0%, #102030 100%)',
                  border: `2px solid ${mode === 'login' ? '#5a8040' : '#4080a0'}`,
                }}
              >
                <span
                  className="text-sm sm:text-base [@media(max-height:500px)]:text-sm"
                  style={{
                    fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive',
                    color: mode === 'login' ? '#a0d080' : '#80c0e0',
                  }}
                >
                  {isLoading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
                </span>
              </button>

              {/* 뒤로가기 */}
              <button
                type="button"
                onClick={() => switchMode('select')}
                className="w-full py-1.5 sm:py-2 [@media(max-height:500px)]:py-3 [@media(max-height:500px)]:px-4 [@media(max-height:500px)]:w-auto text-center transition-all hover:brightness-125 text-xs sm:text-sm [@media(max-height:500px)]:text-sm [@media(max-height:500px)]:border [@media(max-height:500px)]:border-[var(--gold-dark)] [@media(max-height:500px)]:rounded-lg [@media(min-height:501px)]:mt-2"
                style={{ fontFamily: '"NeoDunggeunmo", "Neo둥근모", cursive', color: 'var(--gold-dark)' }}
              >
                ← 뒤로
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
