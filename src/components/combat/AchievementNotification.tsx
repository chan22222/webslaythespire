import { useEffect, useState } from 'react';
import { useStatsStore } from '../../stores/statsStore';
import { getAchievementById } from '../../data/achievements';

export function AchievementNotification() {
  const { recentUnlockedAchievement, clearRecentAchievement } = useStatsStore();
  const [visible, setVisible] = useState(false);
  const [achievement, setAchievement] = useState<{ name: string; icon: string; description: string } | null>(null);

  useEffect(() => {
    if (recentUnlockedAchievement) {
      const ach = getAchievementById(recentUnlockedAchievement);
      if (ach) {
        setAchievement({ name: ach.name, icon: ach.icon, description: ach.description });
        setVisible(true);

        // 3초 후 사라짐
        const hideTimer = setTimeout(() => {
          setVisible(false);
        }, 3000);

        // 애니메이션 완료 후 상태 초기화
        const clearTimer = setTimeout(() => {
          clearRecentAchievement();
          setAchievement(null);
        }, 3500);

        return () => {
          clearTimeout(hideTimer);
          clearTimeout(clearTimer);
        };
      }
    }
  }, [recentUnlockedAchievement, clearRecentAchievement]);

  if (!achievement) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className="px-6 py-4 rounded-lg border-2 flex items-center gap-4"
        style={{
          background: 'linear-gradient(180deg, rgba(50, 40, 20, 0.95) 0%, rgba(30, 25, 15, 0.95) 100%)',
          borderColor: 'var(--gold)',
          boxShadow: '0 0 30px rgba(212, 168, 75, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          fontFamily: '"NeoDunggeunmo", cursive',
        }}
      >
        {/* 아이콘 */}
        <div
          className="w-12 h-12 flex items-center justify-center rounded-lg text-2xl"
          style={{
            background: 'linear-gradient(135deg, #b8860b 0%, #8b6914 100%)',
            boxShadow: '0 0 15px rgba(212, 168, 75, 0.6)',
          }}
        >
          {achievement.icon}
        </div>

        {/* 텍스트 */}
        <div>
          <p
            className="text-xs mb-1"
            style={{ color: 'var(--gold-light)', opacity: 0.8 }}
          >
            업적 달성!
          </p>
          <p
            className="text-lg font-bold"
            style={{
              color: 'var(--gold)',
              textShadow: '0 0 10px var(--gold-glow)',
            }}
          >
            {achievement.name}
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--gold-light)', opacity: 0.7 }}
          >
            {achievement.description}
          </p>
        </div>
      </div>
    </div>
  );
}
