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
  maxHp: 100,
  currentHp: 100,
  gold: 200,
  deck: [],
  relics: [],
  block: 0,
  statuses: [],
});
