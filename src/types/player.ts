import { CardInstance } from './card';
import { Relic } from './relic';
import { Status } from './status';

export interface Player {
  maxHp: number;
  currentHp: number;
  gold: number;
  deck: CardInstance[];
  relics: Relic[];
  block: number;
  statuses: Status[];
}

export const createInitialPlayer = (): Player => ({
  maxHp: 80,
  currentHp: 80,
  gold: 99,
  deck: [],
  relics: [],
  block: 0,
  statuses: [],
});
