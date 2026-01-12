import { useEffect, useState } from 'react';

export interface DamagePopupData {
  id: string;
  value: number;
  type: 'damage' | 'block' | 'heal' | 'buff' | 'debuff' | 'skill';
  x: number;
  y: number;
  modifier?: number; // 버프/디버프로 인한 보정값 (+힘, -약화 등)
}

interface DamagePopupProps {
  popup: DamagePopupData;
  onComplete: (id: string) => void;
}

export function DamagePopup({ popup, onComplete }: DamagePopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete(popup.id), 200);
    }, 800);

    return () => clearTimeout(timer);
  }, [popup.id, onComplete]);

  const getStyles = () => {
    switch (popup.type) {
      case 'damage':
        return {
          color: '#ff4444',
          text: `-${popup.value}`,
          shadow: '0 0 20px rgba(255, 68, 68, 0.8), 0 0 40px rgba(255, 68, 68, 0.4)',
        };
      case 'block':
        return {
          color: '#4a9ad8',
          text: `+${popup.value}`,
          shadow: '0 0 20px rgba(74, 154, 216, 0.8), 0 0 40px rgba(74, 154, 216, 0.4)',
        };
      case 'heal':
        return {
          color: '#4ade80',
          text: `+${popup.value}`,
          shadow: '0 0 20px rgba(74, 222, 128, 0.8), 0 0 40px rgba(74, 222, 128, 0.4)',
        };
      case 'buff':
        return {
          color: '#f5b840',
          text: `+${popup.value}`,
          shadow: '0 0 20px rgba(245, 184, 64, 0.8)',
        };
      case 'debuff':
        return {
          color: '#a855f7',
          text: `${popup.value}`,
          shadow: '0 0 20px rgba(168, 85, 247, 0.8)',
        };
      case 'skill':
        return {
          color: '#7dd3fc',
          text: '✦ ✦ ✦',
          shadow: '0 0 25px rgba(125, 211, 252, 0.9), 0 0 50px rgba(56, 189, 248, 0.5)',
        };
      default:
        return {
          color: '#fff',
          text: `${popup.value}`,
          shadow: 'none',
        };
    }
  };

  const styles = getStyles();

  // 데미지 타입일 때 modifier 부호 반전 (힘 +3 → -3 추가 데미지, 약화 -2 → +2 덜 깎임)
  const getDisplayModifier = () => {
    if (!popup.modifier || popup.type !== 'damage') return popup.modifier;
    return -popup.modifier;
  };

  const displayModifier = getDisplayModifier();

  const getModifierColor = () => {
    if (!displayModifier) return '#fff';
    // 데미지 타입: 마이너스(추가 데미지)는 빨간색, 플러스(덜 깎임)는 초록색
    return displayModifier < 0 ? '#ff6b6b' : '#4ade80';
  };

  const getFontSize = () => {
    if (popup.type === 'damage') return '32px';
    if (popup.type === 'skill') return '28px';
    return '24px';
  };

  const getAnimation = () => {
    if (popup.type === 'skill') return 'skillPopup 1s ease-out forwards';
    return 'damagePopup 0.8s ease-out forwards';
  };

  return (
    <div
      className="fixed pointer-events-none font-title font-bold z-[9999]"
      style={{
        left: popup.x,
        top: popup.y,
        color: styles.color,
        fontSize: getFontSize(),
        textShadow: `${styles.shadow}, 2px 2px 4px rgba(0,0,0,0.8)`,
        transform: 'translate(-50%, -50%)',
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? getAnimation() : 'none',
      }}
    >
      {styles.text}
      {/* 보정값 표시 (우상단에 작게) */}
      {displayModifier !== undefined && displayModifier !== 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-24px',
            fontSize: '14px',
            color: getModifierColor(),
            textShadow: '0 0 8px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.9)',
            fontWeight: 'bold',
          }}
        >
          {displayModifier > 0 ? `+${displayModifier}` : displayModifier}
        </span>
      )}
    </div>
  );
}

// 데미지 팝업 매니저
interface DamagePopupManagerProps {
  popups: DamagePopupData[];
  onPopupComplete: (id: string) => void;
}

export function DamagePopupManager({ popups, onPopupComplete }: DamagePopupManagerProps) {
  return (
    <>
      {popups.map(popup => (
        <DamagePopup key={popup.id} popup={popup} onComplete={onPopupComplete} />
      ))}
      <style>{`
        @keyframes damagePopup {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          20% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          40% {
            transform: translate(-50%, -70%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -120%) scale(0.8);
            opacity: 0;
          }
        }
        @keyframes skillPopup {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
            filter: blur(4px);
          }
          15% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 1;
            filter: blur(0);
          }
          30% {
            transform: translate(-50%, -60%) scale(1.1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -70%) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -100%) scale(0.6);
            opacity: 0;
            filter: blur(2px);
          }
        }
      `}</style>
    </>
  );
}
