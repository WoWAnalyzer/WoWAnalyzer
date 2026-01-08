import { CombatantInfoEvent } from './Events';
import Unit from './Unit';

interface PlayerFight {
  id: number;
}

export interface PlayerInfo extends Unit {
  region?: string;
  server?: string;
  fights: PlayerFight[];
}

export default interface Player extends PlayerInfo {
  combatant: CombatantInfoEvent;
}

export interface PlayerDetails {
  id: number;
  name: string;
  server: string;
  region: string;
  ilvl?: number;
  className: string;
  specName?: string;
  specID?: number;
  role: 'tank' | 'dps' | 'healer';
  guid: number;
}
