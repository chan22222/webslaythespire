import { GameMap, MapNode, NodeType } from '../types/map';
import { randomInt } from './shuffle';

const MAP_HEIGHT = 15; // 층 수
const MAP_WIDTH = 7; // 최대 경로 수
const MIN_PATHS = 3; // 최소 경로 수
const MAX_PATHS = 4; // 최대 경로 수

/**
 * 맵 생성 함수
 * 슬레이 더 스파이어 스타일의 분기 맵을 생성합니다.
 */
export function generateMap(): GameMap {
  const nodes: MapNode[] = [];
  let nodeId = 0;

  // 각 행의 노드 수 결정
  const rowSizes: number[] = [];
  for (let row = 0; row < MAP_HEIGHT; row++) {
    if (row === 0) {
      // 첫 행: 3-4개의 시작점
      rowSizes.push(randomInt(MIN_PATHS, MAX_PATHS));
    } else if (row === MAP_HEIGHT - 1) {
      // 마지막 행: 보스 1개
      rowSizes.push(1);
    } else if (row === 8) {
      // 8층: 보물
      rowSizes.push(randomInt(2, 3));
    } else {
      // 나머지: 2-4개
      rowSizes.push(randomInt(2, 4));
    }
  }

  // 노드 생성
  for (let row = 0; row < MAP_HEIGHT; row++) {
    const nodeCount = rowSizes[row];
    const spacing = MAP_WIDTH / (nodeCount + 1);

    for (let i = 0; i < nodeCount; i++) {
      const col = Math.round(spacing * (i + 1));
      const nodeType = getNodeType(row);

      // 약간의 x 오프셋 추가 (시각적 다양성)
      const xOffset = randomInt(-20, 20);

      nodes.push({
        id: `node-${nodeId++}`,
        type: nodeType,
        row,
        col,
        connections: [],
        visited: false,
        x: col * 100 + 50 + xOffset,
        y: (MAP_HEIGHT - 1 - row) * 80 + 50, // 아래에서 위로
      });
    }
  }

  // 연결 생성
  for (let row = 0; row < MAP_HEIGHT - 1; row++) {
    const currentRowNodes = nodes.filter(n => n.row === row);
    const nextRowNodes = nodes.filter(n => n.row === row + 1);

    currentRowNodes.forEach(currentNode => {
      // 가장 가까운 다음 행 노드들과 연결
      const sortedNextNodes = [...nextRowNodes].sort((a, b) => {
        const distA = Math.abs(a.col - currentNode.col);
        const distB = Math.abs(b.col - currentNode.col);
        return distA - distB;
      });

      // 1-2개의 연결 생성
      const connectionCount = Math.min(randomInt(1, 2), sortedNextNodes.length);
      for (let i = 0; i < connectionCount; i++) {
        if (!currentNode.connections.includes(sortedNextNodes[i].id)) {
          currentNode.connections.push(sortedNextNodes[i].id);
        }
      }
    });

    // 모든 다음 행 노드가 최소 하나의 연결을 가지도록 보장
    nextRowNodes.forEach(nextNode => {
      const hasConnection = currentRowNodes.some(n => n.connections.includes(nextNode.id));
      if (!hasConnection) {
        // 가장 가까운 현재 행 노드와 연결
        const closestNode = currentRowNodes.reduce((closest, node) => {
          const distCurrent = Math.abs(node.col - nextNode.col);
          const distClosest = Math.abs(closest.col - nextNode.col);
          return distCurrent < distClosest ? node : closest;
        });
        closestNode.connections.push(nextNode.id);
      }
    });
  }

  return {
    nodes,
    currentNodeId: null,
    floor: 1,
  };
}

/**
 * 행 번호에 따른 노드 타입 결정
 */
function getNodeType(row: number): NodeType {
  // 마지막 행: 보스
  if (row === MAP_HEIGHT - 1) {
    return 'BOSS';
  }

  // 8층: 보물
  if (row === 8) {
    return 'TREASURE';
  }

  // 6층 또는 13층: 엘리트 가능성 높음
  if (row === 6 || row === 13) {
    return Math.random() < 0.6 ? 'ELITE' : 'ENEMY';
  }

  // 첫 3층: 일반 적만
  if (row < 3) {
    return 'ENEMY';
  }

  // 그 외: 확률적으로 결정
  const roll = Math.random();

  if (roll < 0.45) {
    return 'ENEMY';
  } else if (roll < 0.55) {
    return 'EVENT';
  } else if (roll < 0.70) {
    return 'REST';
  } else if (roll < 0.80) {
    return 'SHOP';
  } else if (roll < 0.90) {
    return 'ELITE';
  } else {
    return 'TREASURE';
  }
}

/**
 * 노드 타입에 따른 아이콘 반환
 */
export function getNodeIcon(type: NodeType): string {
  const icons: Record<NodeType, string> = {
    ENEMY: '👹',
    ELITE: '💀',
    BOSS: '👿',
    REST: '🔥',
    SHOP: '💰',
    EVENT: '❓',
    TREASURE: '📦',
  };
  return icons[type];
}

/**
 * 노드 타입에 따른 색상 반환
 */
export function getNodeColor(type: NodeType): string {
  const colors: Record<NodeType, string> = {
    ENEMY: '#4a9eff',
    ELITE: '#ff6b6b',
    BOSS: '#ff4444',
    REST: '#4ecdc4',
    SHOP: '#ffd700',
    EVENT: '#9b59b6',
    TREASURE: '#f39c12',
  };
  return colors[type];
}
