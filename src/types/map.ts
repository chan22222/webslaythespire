export type NodeType = 'ENEMY' | 'ELITE' | 'BOSS' | 'REST' | 'SHOP' | 'EVENT' | 'TREASURE';

export interface MapNode {
  id: string;
  type: NodeType;
  row: number;
  col: number;
  connections: string[]; // 연결된 다음 노드 ID들
  visited: boolean;
  x: number; // 렌더링용 x좌표
  y: number; // 렌더링용 y좌표
}

export interface GameMap {
  nodes: MapNode[];
  currentNodeId: string | null;
  floor: number; // 현재 Act
}

export const NODE_SYMBOLS: Record<NodeType, string> = {
  ENEMY: '?',
  ELITE: '!',
  BOSS: 'B',
  REST: 'R',
  SHOP: '$',
  EVENT: '?',
  TREASURE: 'T',
};

export const NODE_COLORS: Record<NodeType, string> = {
  ENEMY: '#4a9eff',
  ELITE: '#ff6b6b',
  BOSS: '#ff4444',
  REST: '#4ecdc4',
  SHOP: '#ffd700',
  EVENT: '#9b59b6',
  TREASURE: '#f39c12',
};
