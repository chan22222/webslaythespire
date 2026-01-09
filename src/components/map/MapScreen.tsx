import { useGameStore } from '../../stores/gameStore';
import { MapNode } from './MapNode';
import { HealthBar } from '../common/HealthBar';

export function MapScreen() {
  const { player, map, moveToNode, getAvailableNodes } = useGameStore();
  const availableNodes = getAvailableNodes();

  // 연결선 그리기
  const renderConnections = () => {
    const lines: JSX.Element[] = [];

    map.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = map.nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        const isAvailable = availableNodes.some(n => n.id === targetId) &&
          (map.currentNodeId === node.id || (!map.currentNodeId && node.row === 0));

        // 그라데이션 정의
        const gradientId = `gradient-${node.id}-${targetId}`;

        lines.push(
          <defs key={`def-${node.id}-${targetId}`}>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isAvailable ? 'var(--gold)' : 'rgba(100,100,100,0.3)'} />
              <stop offset="100%" stopColor={isAvailable ? 'var(--gold-light)' : 'rgba(100,100,100,0.2)'} />
            </linearGradient>
          </defs>
        );

        lines.push(
          <line
            key={`${node.id}-${targetId}`}
            x1={node.x}
            y1={node.y}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke={`url(#${gradientId})`}
            strokeWidth={isAvailable ? 3 : 2}
            strokeDasharray={node.visited ? '8,4' : 'none'}
            strokeLinecap="round"
            style={{
              filter: isAvailable ? 'drop-shadow(0 0 4px var(--gold-glow))' : 'none',
            }}
          />
        );
      });
    });

    return lines;
  };

  const handleNodeClick = (nodeId: string) => {
    const isAvailable = availableNodes.some(n => n.id === nodeId);
    if (isAvailable) {
      moveToNode(nodeId);
    }
  };

  return (
    <div className="w-full h-screen bg-[var(--bg-darkest)] texture-noise flex flex-col">
      {/* 상단: 플레이어 정보 */}
      <div
        className="p-2 sm:p-4 flex items-center justify-between relative z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
          borderBottom: '1px solid var(--gold-dark)',
        }}
      >
        <div className="flex items-center gap-2 sm:gap-6">
          {/* 체력 */}
          <div className="flex items-center gap-1 sm:gap-3">
            <div
              className="w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--hp) 0%, var(--hp-dark) 100%)',
                border: '2px solid var(--hp-light)',
                boxShadow: '0 0 10px var(--hp)',
              }}
            >
              <span className="text-sm sm:text-lg">❤️</span>
            </div>
            <div className="w-20 sm:w-36">
              <HealthBar current={player.currentHp} max={player.maxHp} size="md" />
            </div>
          </div>

          {/* 골드 */}
          <div
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
              border: '1px solid var(--gold-dark)',
            }}
          >
            <span className="text-sm sm:text-xl">💰</span>
            <span className="font-title font-bold text-[var(--gold-light)] text-sm sm:text-lg">{player.gold}</span>
          </div>
        </div>

        {/* 유물 - 모바일에서 숨김 */}
        <div className="hidden md:flex items-center gap-3">
          <span className="font-title text-sm text-[var(--gold)] mr-2">유물</span>
          {player.relics.map(relic => (
            <div
              key={relic.id}
              className="w-12 h-12 rounded-lg flex items-center justify-center cursor-help transition-transform hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, var(--bg-light) 0%, var(--bg-dark) 100%)',
                border: '2px solid var(--gold-dark)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
              title={`${relic.name}: ${relic.description}`}
            >
              <span className="text-2xl">
                {relic.id === 'burning_blood' && '🔥'}
                {relic.id === 'ring_of_the_snake' && '🐍'}
                {relic.id === 'cracked_core' && '💎'}
                {relic.id === 'anchor' && '⚓'}
                {relic.id === 'vajra' && '💪'}
                {relic.id === 'lantern' && '🏮'}
              </span>
            </div>
          ))}
        </div>

        {/* 덱 정보 */}
        <div
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg cursor-pointer hover:brightness-110 transition-all"
          style={{
            background: 'linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
            border: '1px solid var(--gold-dark)',
          }}
        >
          <span className="text-sm sm:text-xl">📚</span>
          <span className="font-title text-xs sm:text-sm text-[var(--gold-light)]">
            <span className="text-white">{player.deck.length}</span>장
          </span>
        </div>
      </div>

      {/* 맵 영역 */}
      <div className="flex-1 overflow-auto p-4 relative">
        {/* 배경 그라데이션 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, var(--bg-dark) 0%, var(--bg-darkest) 100%)',
          }}
        />

        <div className="relative w-full" style={{ height: '1300px' }}>
          {/* 연결선 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {renderConnections()}
          </svg>

          {/* 노드 */}
          {map.nodes.map(node => (
            <MapNode
              key={node.id}
              node={node}
              isAvailable={availableNodes.some(n => n.id === node.id)}
              isCurrent={map.currentNodeId === node.id}
              onClick={() => handleNodeClick(node.id)}
            />
          ))}
        </div>
      </div>

      {/* 범례 - 모바일에서 숨김 */}
      <div
        className="hidden sm:flex p-2 sm:p-4 justify-center gap-3 sm:gap-8 relative z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
          borderTop: '1px solid var(--gold-dark)',
        }}
      >
        {[
          { icon: '👹', label: '적', color: 'var(--attack)' },
          { icon: '💀', label: '엘리트', color: 'var(--attack-light)' },
          { icon: '👿', label: '보스', color: '#ff4757' },
          { icon: '🔥', label: '휴식', color: 'var(--energy)' },
          { icon: '💰', label: '상점', color: 'var(--gold)' },
          { icon: '❓', label: '이벤트', color: 'var(--skill)' },
          { icon: '📦', label: '보물', color: 'var(--gold-light)' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1 sm:gap-2">
            <div
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--bg-medium) 0%, var(--bg-dark) 100%)',
                border: `2px solid ${item.color}`,
                boxShadow: `0 0 8px ${item.color}40`,
              }}
            >
              <span className="text-xs sm:text-sm">{item.icon}</span>
            </div>
            <span className="font-card text-xs sm:text-sm" style={{ color: item.color }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
