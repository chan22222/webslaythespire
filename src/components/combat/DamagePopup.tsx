import { useEffect, useState } from 'react';

export interface DamagePopupData {
  id: string;
  value: number;
  type: 'damage' | 'block' | 'heal' | 'buff' | 'debuff';
  x: number;
  y: number;
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
      default:
        return {
          color: '#fff',
          text: `${popup.value}`,
          shadow: 'none',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="fixed pointer-events-none font-title font-bold z-[9999]"
      style={{
        left: popup.x,
        top: popup.y,
        color: styles.color,
        fontSize: popup.type === 'damage' ? '32px' : '24px',
        textShadow: `${styles.shadow}, 2px 2px 4px rgba(0,0,0,0.8)`,
        transform: 'translate(-50%, -50%)',
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? 'damagePopup 0.8s ease-out forwards' : 'none',
      }}
    >
      {styles.text}
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
      `}</style>
    </>
  );
}
