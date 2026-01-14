import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { MapNode } from './MapNode';
import { HealthBar } from '../common/HealthBar';
import { Card } from '../combat/Card';

// 파티클 데이터 - 타이틀과 동일
const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  left: Math.random() * 100,
  delay: Math.random() * 10,
  duration: Math.random() * 10 + 15,
  opacity: Math.random() * 0.3 + 0.1,
}));

const MAP_WIDTH = 2050;
const MAP_PADDING = 80; // 맵 좌우 패딩
const VIEW_STEP = 400; // 버튼 클릭시 이동 거리

export function MapScreen() {
  const { player, map, moveToNode, getAvailableNodes } = useGameStore();
  const availableNodes = getAvailableNodes();
  const [showDeck, setShowDeck] = useState(false);
  const [viewOffset, setViewOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 처음 등장시에만 현재 노드 위치로 중앙 정렬
  const initializedRef = useRef(false);
  const prevNodesLengthRef = useRef(map.nodes.length);

  useEffect(() => {
    // 노드가 새로 추가되면 (NEXT_FLOOR 등) 스크롤 다시 초기화
    if (map.nodes.length !== prevNodesLengthRef.current) {
      initializedRef.current = false;
      prevNodesLengthRef.current = map.nodes.length;
    }

    if (initializedRef.current) return;

    // NEXT_FLOOR 노드가 있으면 해당 위치로, 아니면 현재 노드로
    const nextFloorNode = map.nodes.find(n => n.type === 'NEXT_FLOOR' && !n.visited);
    const currentNode = nextFloorNode
      || (map.currentNodeId ? map.nodes.find(n => n.id === map.currentNodeId) : null)
      || availableNodes[0];

    if (currentNode && containerRef.current) {
      // 좌우 패딩 고려
      const containerWidth = containerRef.current.clientWidth;
      const effectiveWidth = containerWidth - MAP_PADDING * 2;
      const targetOffset = Math.max(0, Math.min(
        MAP_WIDTH - effectiveWidth,
        currentNode.x - effectiveWidth / 2
      ));
      setViewOffset(targetOffset);
      initializedRef.current = true;
    }
  }, [map.currentNodeId, availableNodes, map.nodes.length]);

  const handleNavLeft = () => {
    setViewOffset(prev => Math.max(0, prev - VIEW_STEP));
  };

  const handleNavRight = () => {
    if (containerRef.current) {
      // 좌우 패딩 고려
      const maxOffset = MAP_WIDTH - containerRef.current.clientWidth + MAP_PADDING * 2;
      setViewOffset(prev => Math.min(maxOffset, prev + VIEW_STEP));
    }
  };

  // 연결선 렌더링
  const renderConnections = () => {
    const elements: JSX.Element[] = [];

    map.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = map.nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        const isAvailable = availableNodes.some(n => n.id === targetId) &&
          (map.currentNodeId === node.id || (!map.currentNodeId && node.row === 0));
        const isVisited = node.visited;

        const key = `${node.id}-${targetId}`;


        elements.push(
          <line
            key={`line-${key}`}
            x1={node.x}
            y1={node.y}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke={isAvailable ? 'rgba(212, 168, 75, 1)' : isVisited ? 'rgba(120, 105, 80, 0.7)' : 'rgba(100, 90, 70, 0.5)'}
            strokeWidth={isAvailable ? 4 : 3}
            strokeLinecap="round"
            strokeDasharray="6,10"
            style={isAvailable ? { filter: 'drop-shadow(0 0 4px rgba(212, 168, 75, 0.8))' } : undefined}
          />
        );
      });
    });

    return elements;
  };

  const handleNodeClick = (nodeId: string) => {
    if (availableNodes.some(n => n.id === nodeId)) {
      moveToNode(nodeId);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden relative">
      {/* 배경 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, #15121a 0%, #0a0a10 50%, #000 100%)',
        }}
      />

      {/* 소용돌이 링들 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${(i + 1) * 14}%`,
              height: `${(i + 1) * 14}%`,
              border: `1px solid rgba(212, 168, 75, ${0.08 - i * 0.01})`,
              boxShadow: `0 0 ${12 - i * 2}px rgba(212, 168, 75, ${0.12 - i * 0.015})`,
              animation: `vortexSpin ${15 + i * 5}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
            }}
          />
        ))}
      </div>

      {/* 중앙 글로우 */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212,168,75,0.25) 0%, rgba(212,168,75,0.1) 30%, transparent 60%)',
          animation: 'blackholePulse 3s ease-in-out infinite',
        }}
      />

      {/* 떠오르는 파티클들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-[var(--gold)]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              bottom: '-20px',
              opacity: p.opacity,
              animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* 외곽 비네트 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* 상단 HUD */}
      <header
        className="relative z-30 px-6 pt-9 pb-4"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 8, 5, 0.95) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* HP & Gold */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 relative group cursor-help">
              <span
                className="text-base font-bold"
                style={{
                  fontFamily: '"NeoDunggeunmo", cursive',
                  color: '#ef4444',
                  textShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                }}
              >
                HP
              </span>
              <div className="w-32">
                <HealthBar current={player.currentHp} max={player.maxHp} size="md" showNumbers={true} />
              </div>
              {/* HP 툴팁 */}
              <div
                className="absolute z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{
                  left: '50%',
                  top: 'calc(100% + 12px)',
                  transform: 'translateX(-50%)',
                  background: 'rgba(10, 8, 5, 0.95)',
                  padding: '12px 18px',
                  border: '2px solid var(--gold-dark)',
                  boxShadow: '0 0 16px rgba(0,0,0,0.9), 0 0 6px var(--gold-glow)',
                  minWidth: '200px',
                }}
              >
                <div
                  className="absolute left-1/2 -top-[8px]"
                  style={{
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '8px solid var(--gold-dark)',
                  }}
                />
                <div
                  className="text-sm font-bold"
                  style={{
                    fontFamily: '"NeoDunggeunmo", cursive',
                    color: '#ef4444',
                  }}
                >
                  체력
                </div>
                <div
                  className="text-sm mt-1"
                  style={{
                    fontFamily: '"NeoDunggeunmo", cursive',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  현재 체력이 0이 되면 게임 오버
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 relative group cursor-help"
              style={{
                background: 'rgba(212, 168, 75, 0.15)',
                border: '2px solid rgba(212, 168, 75, 0.4)',
              }}
            >
              <span
                className="text-base font-bold"
                style={{
                  fontFamily: '"NeoDunggeunmo", cursive',
                  color: 'var(--gold)',
                }}
              >
                G
              </span>
              <span
                className="text-base font-bold tabular-nums"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  color: 'var(--gold)',
                  textShadow: '0 0 6px var(--gold-glow)',
                }}
              >
                {player.gold}
              </span>
              {/* Gold 툴팁 */}
              <div
                className="absolute z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{
                  left: '50%',
                  top: 'calc(100% + 12px)',
                  transform: 'translateX(-50%)',
                  background: 'rgba(10, 8, 5, 0.95)',
                  padding: '12px 18px',
                  border: '2px solid var(--gold-dark)',
                  boxShadow: '0 0 16px rgba(0,0,0,0.9), 0 0 6px var(--gold-glow)',
                  minWidth: '200px',
                }}
              >
                <div
                  className="absolute left-1/2 -top-[8px]"
                  style={{
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '8px solid var(--gold-dark)',
                  }}
                />
                <div
                  className="text-sm font-bold"
                  style={{
                    fontFamily: '"NeoDunggeunmo", cursive',
                    color: 'var(--gold)',
                  }}
                >
                  골드
                </div>
                <div
                  className="text-sm mt-1"
                  style={{
                    fontFamily: '"NeoDunggeunmo", cursive',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  상점에서 카드와 유물을 구매
                </div>
              </div>
            </div>
          </div>

          {/* Floor */}
          <div
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center group cursor-help"
            style={{
              backgroundImage: 'url(/floor.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              width: '300px',
              height: '150px',
              imageRendering: 'pixelated',
            }}
          >
            <div className="flex flex-col items-center" style={{ marginTop: '18px' }}>
              <span
                className="text-sm tracking-widest relative z-10"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  color: '#3a3a3a',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                FLOOR
              </span>
              <span
                className="text-4xl font-bold tabular-nums"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  color: '#3a3a3a',
                }}
              >
                {map.floor}
              </span>
            </div>
            {/* Floor 툴팁 */}
            <div
              className="absolute z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{
                left: '50%',
                top: 'calc(100% + 12px)',
                transform: 'translateX(-50%)',
                background: 'rgba(10, 8, 5, 0.95)',
                padding: '12px 18px',
                border: '2px solid var(--gold-dark)',
                boxShadow: '0 0 16px rgba(0,0,0,0.9), 0 0 6px var(--gold-glow)',
                minWidth: '200px',
              }}
            >
              <div
                className="absolute left-1/2 -top-[8px]"
                style={{
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid var(--gold-dark)',
                }}
              />
              <div
                className="text-sm font-bold"
                style={{
                  fontFamily: '"NeoDunggeunmo", cursive',
                  color: 'var(--gold)',
                }}
              >
                현재 층
              </div>
              <div
                className="text-sm mt-1"
                style={{
                  fontFamily: '"NeoDunggeunmo", cursive',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                보스를 처치하면 다음 층으로 이동
              </div>
            </div>
          </div>

          {/* Deck & Relics */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-0">
              {player.relics.map(relic => (
                <div
                  key={relic.id}
                  className="relative cursor-help group"
                >
                  {relic.icon ? (
                    <img
                      src={relic.icon}
                      alt={relic.name}
                      className="w-24 h-24 object-contain transition-all duration-150 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(212,168,75,0.9)]"
                      style={{ imageRendering: 'auto' }}
                    />
                  ) : (
                    <span
                      className="text-sm font-bold"
                      style={{
                        fontFamily: '"NeoDunggeunmo", cursive',
                        color: 'var(--gold)',
                      }}
                    >
                      {relic.name.charAt(0)}
                    </span>
                  )}
                  {/* 툴팁 */}
                  <div
                    className="absolute z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{
                      left: '50%',
                      top: 'calc(100% + 12px)',
                      transform: 'translateX(-50%)',
                      background: 'rgba(10, 8, 5, 0.95)',
                      padding: '12px 18px',
                      border: '2px solid var(--gold-dark)',
                      boxShadow: '0 0 16px rgba(0,0,0,0.9), 0 0 6px var(--gold-glow)',
                      minWidth: '280px',
                    }}
                  >
                    <div
                      className="absolute left-1/2 -top-[8px]"
                      style={{
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderBottom: '8px solid var(--gold-dark)',
                      }}
                    />
                    <div
                      className="text-sm font-bold"
                      style={{
                        fontFamily: '"NeoDunggeunmo", cursive',
                        color: 'var(--gold)',
                      }}
                    >
                      {relic.name}
                    </div>
                    <div
                      className="text-sm mt-1 whitespace-normal max-w-80"
                      style={{
                        fontFamily: '"NeoDunggeunmo", cursive',
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      {relic.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative group">
              <button
                onClick={() => setShowDeck(true)}
                className="flex flex-col items-center justify-center gap-0 transition-all duration-150 hover:brightness-125"
                style={{
                  backgroundImage: 'url(/card.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  width: '96px',
                  height: '120px',
                  imageRendering: 'pixelated',
                  border: 'none',
                }}
              >
                <span
                  className="text-base font-bold"
                  style={{
                    fontFamily: '"NeoDunggeunmo", cursive',
                    color: 'var(--gold)',
                  }}
                >
                  덱
                </span>
                <span
                  className="text-base font-bold tabular-nums"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    color: 'var(--gold)',
                  }}
                >
                  {player.deck.length}
                </span>
              </button>
              {/* 덱 툴팁 */}
              <div
                className="absolute z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{
                  left: '50%',
                  top: 'calc(100% + 12px)',
                  transform: 'translateX(-50%)',
                  background: 'rgba(10, 8, 5, 0.95)',
                  padding: '12px 18px',
                  border: '2px solid var(--gold-dark)',
                  boxShadow: '0 0 16px rgba(0,0,0,0.9), 0 0 6px var(--gold-glow)',
                  minWidth: '200px',
                }}
              >
                <div
                  className="absolute left-1/2 -top-[8px]"
                  style={{
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '8px solid var(--gold-dark)',
                  }}
                />
                <div
                  className="text-sm font-bold"
                  style={{
                    fontFamily: '"NeoDunggeunmo", cursive',
                    color: 'var(--gold)',
                  }}
                >
                  카드 덱
                </div>
                <div
                  className="text-sm mt-1"
                  style={{
                    fontFamily: '"NeoDunggeunmo", cursive',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  클릭하여 보유 카드 확인
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 맵 영역 */}
      <main ref={containerRef} className="flex-1 relative overflow-hidden pt-8">
        {/* 맵 컨테이너 - 좌우 여백 */}
        <div
          className="absolute top-0 h-full transition-transform duration-300 ease-out"
          style={{
            width: MAP_WIDTH,
            left: MAP_PADDING,
            transform: `translateX(-${viewOffset}px)`,
          }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {renderConnections()}
          </svg>

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

        {/* 좌측 네비게이션 버튼 */}
        <button
          onClick={handleNavLeft}
          disabled={viewOffset <= 0}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 transition-all duration-150 hover:scale-125 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <img
            src="/sprites/icon/left_arrow.png"
            alt="Left"
            className="w-14 h-auto"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        </button>

        {/* 우측 네비게이션 버튼 */}
        <button
          onClick={handleNavRight}
          disabled={containerRef.current ? viewOffset >= MAP_WIDTH - containerRef.current.clientWidth + MAP_PADDING * 2 : false}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 transition-all duration-150 hover:scale-125 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <img
            src="/sprites/icon/right_arrow.png"
            alt="Right"
            className="w-14 h-auto"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        </button>
      </main>

      {/* 덱 모달 */}
      {showDeck && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.9)' }}
          onClick={() => setShowDeck(false)}
        >
          <div
            className="w-[94%] max-w-5xl max-h-[88vh] overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(20, 16, 10, 0.98) 0%, rgba(10, 8, 5, 0.99) 100%)',
              border: '3px solid var(--gold-dark)',
              boxShadow: '0 0 50px rgba(0,0,0,0.9), 0 0 10px var(--gold-glow)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="flex justify-between items-center px-6 py-4"
              style={{ borderBottom: '2px solid rgba(212, 168, 75, 0.3)' }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: '"NeoDunggeunmo", cursive',
                    color: 'var(--gold)',
                  }}
                >
                  보유 카드
                </span>
                <span
                  className="text-sm"
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    color: 'var(--gold-dark)',
                  }}
                >
                  {player.deck.length}장
                </span>
              </div>

              <button
                onClick={() => setShowDeck(false)}
                className="w-10 h-10 flex items-center justify-center transition-all hover:brightness-125"
                style={{ color: 'var(--gold)' }}
              >
                <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '16px' }}>×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-wrap justify-center gap-4">
                {player.deck.map((card, index) => (
                  <Card key={card.instanceId || index} card={card} size="md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 애니메이션 keyframes */}
      <style>{`
        @keyframes vortexSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes blackholePulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
