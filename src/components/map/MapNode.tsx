import { MapNode as MapNodeType } from '../../types/map';
import { getNodeIcon } from '../../utils/mapGenerator';

interface MapNodeProps {
  node: MapNodeType;
  isAvailable: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

export function MapNode({ node, isAvailable, isCurrent, onClick }: MapNodeProps) {
  const icon = getNodeIcon(node.type);

  const isDisabled = !isAvailable && !node.visited;

  // 노드 타입별 색상 설정
  const getNodeStyle = () => {
    const baseStyle = {
      background: '',
      borderColor: '',
      boxShadow: '',
    };

    switch (node.type) {
      case 'ENEMY':
        baseStyle.background = 'linear-gradient(135deg, #2a1515 0%, #1a0a0a 100%)';
        baseStyle.borderColor = 'var(--attack)';
        break;
      case 'ELITE':
        baseStyle.background = 'linear-gradient(135deg, #3a1a1a 0%, #2a0a0a 100%)';
        baseStyle.borderColor = 'var(--attack-light)';
        break;
      case 'BOSS':
        baseStyle.background = 'linear-gradient(135deg, #4a1a1a 0%, #300808 100%)';
        baseStyle.borderColor = '#ff4757';
        break;
      case 'REST':
        baseStyle.background = 'linear-gradient(135deg, #2a2515 0%, #1a1508 100%)';
        baseStyle.borderColor = 'var(--energy)';
        break;
      case 'SHOP':
        baseStyle.background = 'linear-gradient(135deg, #2a2a15 0%, #1a1a08 100%)';
        baseStyle.borderColor = 'var(--gold)';
        break;
      case 'EVENT':
        baseStyle.background = 'linear-gradient(135deg, #1a2a2a 0%, #0a1a1a 100%)';
        baseStyle.borderColor = 'var(--skill)';
        break;
      case 'TREASURE':
        baseStyle.background = 'linear-gradient(135deg, #2a2a1a 0%, #1a1a0a 100%)';
        baseStyle.borderColor = 'var(--gold-light)';
        break;
      default:
        baseStyle.background = 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%)';
        baseStyle.borderColor = 'var(--gold-dark)';
    }

    if (isAvailable && !node.visited) {
      baseStyle.boxShadow = `0 0 20px ${baseStyle.borderColor}, 0 0 40px ${baseStyle.borderColor}40`;
    } else if (isCurrent) {
      baseStyle.boxShadow = '0 0 30px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3)';
    } else {
      baseStyle.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
    }

    return baseStyle;
  };

  const nodeStyle = getNodeStyle();

  return (
    <div
      onClick={isAvailable ? onClick : undefined}
      className={`
        absolute w-14 h-14 rounded-full
        flex items-center justify-center
        border-3 transition-all duration-300
        ${node.visited ? 'opacity-40' : ''}
        ${isCurrent ? 'ring-4 ring-white scale-125 z-20' : ''}
        ${isAvailable && !node.visited ? 'cursor-pointer hover:scale-125 z-10' : ''}
        ${isDisabled ? 'opacity-50 saturate-50 brightness-75' : ''}
      `}
      style={{
        left: node.x - 28,
        top: node.y - 28,
        background: nodeStyle.background,
        borderWidth: '3px',
        borderStyle: 'solid',
        borderColor: isAvailable && !node.visited ? nodeStyle.borderColor : 'rgba(100,100,100,0.5)',
        boxShadow: nodeStyle.boxShadow,
      }}
    >
      {/* 내부 장식 링 */}
      <div
        className={`absolute inset-1 rounded-full border ${isDisabled ? 'opacity-30' : 'opacity-50'}`}
        style={{ borderColor: nodeStyle.borderColor }}
      />

      {/* 아이콘 */}
      <span
        className={`text-2xl relative z-10 ${isDisabled ? 'opacity-60' : ''}`}
        style={{
          filter: isAvailable && !node.visited ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none',
        }}
      >
        {icon}
      </span>

      {/* 이용 가능 표시 (펄스 애니메이션) */}
      {isAvailable && !node.visited && (
        <div
          className="absolute inset-0 rounded-full animate-ping pointer-events-none"
          style={{
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: nodeStyle.borderColor,
            opacity: 0.3,
          }}
        />
      )}

      {/* 현재 위치 표시 */}
      {isCurrent && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <span className="text-xs font-title text-white bg-black/50 px-2 py-0.5 rounded">현재</span>
        </div>
      )}
    </div>
  );
}
