import { GameMap, MapNode, NodeType } from '../types/map';
import { randomInt } from './shuffle';

const MAP_COLUMNS = 15; // 열(스테이지) 수
const MAP_ROWS = 5; // 최대 경로 수 (세로)
const MIN_PATHS = 2; // 최소 경로 수
const MAX_PATHS = 4; // 최대 경로 수

/**
 * 맵 생성 함수
 * 가로 스크롤 방식의 분기 맵을 생성합니다.
 * 왼쪽에서 시작해서 오른쪽으로 진행합니다.
 */
export function generateMap(): GameMap {
  const nodes: MapNode[] = [];
  let nodeId = 0;

  // 각 열(스테이지)의 노드 수 결정
  const colSizes: number[] = [];
  for (let col = 0; col < MAP_COLUMNS; col++) {
    if (col === 0) {
      // 첫 열: 2-3개의 시작점
      colSizes.push(randomInt(MIN_PATHS, 3));
    } else if (col === MAP_COLUMNS - 1) {
      // 마지막 열: 보스 1개
      colSizes.push(1);
    } else if (col === 8) {
      // 8열: 보물
      colSizes.push(randomInt(2, 3));
    } else {
      // 나머지: 2-4개
      colSizes.push(randomInt(2, MAX_PATHS));
    }
  }

  // 노드 생성 (가로 배치)
  for (let col = 0; col < MAP_COLUMNS; col++) {
    const nodeCount = colSizes[col];
    const spacing = MAP_ROWS / (nodeCount + 1);

    for (let i = 0; i < nodeCount; i++) {
      const row = Math.round(spacing * (i + 1));
      const nodeType = getNodeType(col);

      // 약간의 y 오프셋 추가 (시각적 다양성)
      const yOffset = randomInt(-15, 15);

      nodes.push({
        id: `node-${nodeId++}`,
        type: nodeType,
        row: col, // 이제 row는 x축 위치 (스테이지)를 나타냄
        col: row, // col은 y축 위치 (분기)를 나타냄
        connections: [],
        visited: false,
        x: col * 120 + 80, // 왼쪽에서 오른쪽으로
        y: row * 100 + 80 + yOffset, // 세로 분기
      });
    }
  }

  // 연결 생성 (왼쪽에서 오른쪽으로)
  for (let col = 0; col < MAP_COLUMNS - 1; col++) {
    const currentColNodes = nodes.filter(n => n.row === col);
    const nextColNodes = nodes.filter(n => n.row === col + 1);

    currentColNodes.forEach(currentNode => {
      // 가장 가까운 다음 열 노드들과 연결
      const sortedNextNodes = [...nextColNodes].sort((a, b) => {
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

    // 모든 다음 열 노드가 최소 하나의 연결을 가지도록 보장
    nextColNodes.forEach(nextNode => {
      const hasConnection = currentColNodes.some(n => n.connections.includes(nextNode.id));
      if (!hasConnection) {
        // 가장 가까운 현재 열 노드와 연결
        const closestNode = currentColNodes.reduce((closest, node) => {
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
 * 열(스테이지) 번호에 따른 노드 타입 결정
 */
function getNodeType(col: number): NodeType {
  // 마지막 열: 보스
  if (col === MAP_COLUMNS - 1) {
    return 'BOSS';
  }

  // 8열: 보물
  if (col === 8) {
    return 'TREASURE';
  }

  // 6열 또는 13열: 엘리트 가능성 높음
  if (col === 6 || col === 13) {
    return Math.random() < 0.6 ? 'ELITE' : 'ENEMY';
  }

  // 첫 3열: 일반 적만
  if (col < 3) {
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
