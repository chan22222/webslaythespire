import { useState, useEffect } from 'react';
import { useStatsStore } from '../../stores/statsStore';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { ALL_CARDS } from '../../data/cards';
import { playButtonHover, playButtonClick } from '../../utils/sound';

// 카드 ID로 카드 이름 찾기
const getCardNameById = (cardId: string): string | null => {
  const card = ALL_CARDS.find(c => c.id === cardId);
  return card ? card.name : null;
};

// 숫자 포맷팅 (1000 -> 1,000)
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

interface StatsPanelProps {
  // 외부 제어 모드 (버튼 없이 모달만)
  externalControl?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  // 버튼 숨기기 (저장 정보)
  hideSaveInfo?: boolean;
  // 커스텀 버튼 렌더링
  renderButton?: (onClick: () => void) => React.ReactNode;
}

export function StatsPanel({ externalControl, isOpen: externalIsOpen, onClose, hideSaveInfo, renderButton }: StatsPanelProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
  const { stats, unlockedAchievements, loadStats, isLoading } = useStatsStore();
  const { hasSaveData, map, player } = useGameStore();
  const { user, isGuest } = useAuthStore();

  // 실제 사용할 상태
  const isOpen = externalControl ? externalIsOpen : internalIsOpen;
  const handleClose = externalControl ? onClose : () => setInternalIsOpen(false);

  // 선택된 업적 정보
  const selectedAchievement = selectedAchievementId
    ? ACHIEVEMENTS.find(a => a.id === selectedAchievementId)
    : null;

  // 로그인 시 통계 불러오기
  useEffect(() => {
    if (user && !isGuest) {
      loadStats();
    }
  }, [user, isGuest, loadStats]);

  const unlockedCount = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <>
      {/* 통계 버튼 (외부 제어 모드가 아닐 때만) */}
      {!externalControl && (
        renderButton ? (
          renderButton(() => setInternalIsOpen(true))
        ) : (
          <button
            onMouseEnter={playButtonHover}
            onClick={() => {
              playButtonClick();
              setInternalIsOpen(true);
            }}
            className="px-3 py-2 rounded-lg transition-all hover:scale-105 hover:brightness-125 flex items-center gap-2"
            style={{
              fontFamily: '"NeoDunggeunmo", cursive',
              background: 'linear-gradient(180deg, rgba(30, 25, 18, 0.9) 0%, rgba(15, 12, 8, 0.9) 100%)',
              border: '1px solid var(--gold-dark)',
              color: 'var(--gold-light)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            <span className="text-sm">통계&업적</span>
          </button>
        )
      )}

      {/* 통계 모달 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={handleClose}
        >
          <div
            className="relative p-6 rounded-lg border-2 border-[var(--gold-dark)] max-w-lg w-full mx-4 max-h-[85vh] flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #1a1510 0%, #0d0a08 100%)',
              boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(212,168,75,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <h3
              className="text-[var(--gold)] text-center mb-4 text-xl"
              style={{
                fontFamily: '"NeoDunggeunmo", cursive',
                textShadow: '0 0 10px var(--gold-glow)',
              }}
            >
              플레이어 통계
            </h3>

            {isGuest ? (
              <p
                className="text-center text-[var(--gold-light)] opacity-70 text-base mb-4"
                style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
              >
                로그인하면 통계가 저장됩니다
              </p>
            ) : isLoading ? (
              <p
                className="text-center text-[var(--gold-light)] opacity-70 text-base mb-4"
                style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
              >
                불러오는 중...
              </p>
            ) : null}

            {/* 저장 정보 */}
            {hasSaveData && !isGuest && !hideSaveInfo && (
              <div
                className="mb-4 p-3 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(212, 168, 75, 0.3)',
                }}
              >
                <h4
                  className="text-[var(--gold)] text-base mb-2 flex items-center gap-2"
                  style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
                >
                  저장된 게임
                </h4>
                <div
                  className="text-[var(--gold-light)] text-sm space-y-1"
                  style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
                >
                  <p>현재 층: {map.floor}</p>
                  <p>HP: {player.currentHp} / {player.maxHp}</p>
                  <p>덱: {player.deck.length}장 / 유물: {player.relics.length}개</p>
                  <p>골드: {player.gold}</p>
                </div>
              </div>
            )}

            {/* 통계 그리드 (스크롤 영역) */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-1" style={{ fontFamily: '"NeoDunggeunmo", cursive' }}>
              {/* 처치 통계 */}
              <div
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(212, 168, 75, 0.2)',
                }}
              >
                <h4 className="text-[var(--gold)] text-base mb-2">
                  처치한 적
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 처치</span>
                    <span className="text-white">{formatNumber(stats.totalKills)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">일반</span>
                    <span className="text-white">{formatNumber(stats.mobKills)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">엘리트</span>
                    <span className="text-yellow-400">{formatNumber(stats.eliteKills)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">보스</span>
                    <span className="text-red-400">{formatNumber(stats.bossKills)}</span>
                  </div>
                </div>
              </div>

              {/* 카드 사용 통계 */}
              <div
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(212, 168, 75, 0.2)',
                }}
              >
                <h4 className="text-[var(--gold)] text-base mb-2">
                  카드 사용
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 사용</span>
                    <span className="text-white">{formatNumber(stats.totalCardsPlayed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">공격</span>
                    <span className="text-orange-400">{formatNumber(stats.attackCardsPlayed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">방어</span>
                    <span className="text-blue-400">{formatNumber(stats.shieldCardsPlayed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">가젯</span>
                    <span className="text-green-400">{formatNumber(stats.gadgetCardsPlayed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">효과</span>
                    <span className="text-purple-400">{formatNumber(stats.effectCardsPlayed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">지형</span>
                    <span className="text-amber-600">{formatNumber(stats.terrainCardsPlayed)}</span>
                  </div>
                </div>
              </div>

              {/* 전투 통계 */}
              <div
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(212, 168, 75, 0.2)',
                }}
              >
                <h4 className="text-[var(--gold)] text-base mb-2">
                  전투 통계
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 입힌 데미지</span>
                    <span className="text-red-400">{formatNumber(stats.totalDamageDealt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 받은 데미지</span>
                    <span className="text-orange-400">{formatNumber(stats.totalDamageTaken)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 방어도 획득</span>
                    <span className="text-blue-400">{formatNumber(stats.totalBlockGained)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 힘 획득</span>
                    <span className="text-green-400">{formatNumber(stats.totalStrengthGained)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">카드로 잃은 HP</span>
                    <span className="text-pink-400">{formatNumber(stats.totalHpLostByCards)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 회복량</span>
                    <span className="text-emerald-400">{formatNumber(stats.totalHealing)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">총 에너지 사용</span>
                    <span className="text-yellow-400">{formatNumber(stats.totalEnergyUsed)}</span>
                  </div>
                </div>
              </div>

              {/* 게임 진행 통계 */}
              <div
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(212, 168, 75, 0.2)',
                }}
              >
                <h4 className="text-[var(--gold)] text-base mb-2">
                  게임 진행
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">게임 시작</span>
                    <span className="text-white">{formatNumber(stats.totalGamesStarted)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">승리</span>
                    <span className="text-yellow-400">{formatNumber(stats.totalVictories)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">패배</span>
                    <span className="text-red-400">{formatNumber(stats.totalDefeats)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">최고 층</span>
                    <span className="text-cyan-400">{stats.highestFloorReached}</span>
                  </div>
                </div>
              </div>

              {/* 업적 (스크롤 영역 안) */}
              <div
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(212, 168, 75, 0.2)',
                }}
              >
                <h4 className="text-[var(--gold)] text-base mb-3 flex items-center justify-between">
                  <span>업적</span>
                  <span className="text-sm text-gray-400">
                    {unlockedCount} / {totalAchievements}
                  </span>
                </h4>
                <div className="grid grid-cols-6 gap-2">
                  {ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = unlockedAchievements.includes(achievement.id);
                    const isHidden = achievement.hidden && !isUnlocked;
                    const isSelected = selectedAchievementId === achievement.id;
                    return (
                      <div
                        key={achievement.id}
                        onClick={() => setSelectedAchievementId(achievement.id)}
                        onMouseEnter={() => setSelectedAchievementId(achievement.id)}
                        className={`w-8 h-8 flex items-center justify-center rounded transition-all cursor-pointer ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border border-yellow-500'
                            : 'bg-gray-800 border border-gray-700 opacity-40'
                        } ${isSelected ? 'ring-2 ring-white scale-110' : ''}`}
                      >
                        <span className="text-sm">{isHidden ? '?' : achievement.icon}</span>
                      </div>
                    );
                  })}
                </div>
                {/* 선택된 업적 정보 (인라인, 고정 높이) */}
                <div
                  className="mt-3 p-3 rounded"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--gold-dark)',
                    minHeight: '80px',
                  }}
                >
                  {selectedAchievement ? (
                    (() => {
                      const isUnlocked = unlockedAchievements.includes(selectedAchievement.id);
                      const isHidden = selectedAchievement.hidden && !isUnlocked;
                      return (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{isHidden ? '?' : selectedAchievement.icon}</span>
                            <span className={`font-bold text-base ${isUnlocked ? 'text-yellow-400' : 'text-gray-400'}`}>
                              {isHidden ? '???' : selectedAchievement.name}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{isHidden ? '???' : selectedAchievement.description}</p>
                          {selectedAchievement.unlocksCard && (
                            <p className="text-cyan-400 text-sm mt-2">
                              해금: {getCardNameById(selectedAchievement.unlocksCard) || selectedAchievement.unlocksCard}
                            </p>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <p className="text-gray-500 text-sm">업적을 선택하면 상세 정보가 표시됩니다</p>
                  )}
                </div>
              </div>

            </div>

            {/* 닫기 버튼 */}
            <button
              onMouseEnter={playButtonHover}
              onClick={() => {
                playButtonClick();
                handleClose?.();
              }}
              className="mt-4 w-full px-4 py-2 rounded border border-[var(--gold-dark)] text-[var(--gold-light)] text-base hover:bg-[var(--gold-dark)]/20 transition-colors"
              style={{ fontFamily: '"NeoDunggeunmo", cursive' }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
