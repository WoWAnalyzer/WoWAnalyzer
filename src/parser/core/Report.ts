import { EnemyInfo } from './Enemy';
import { WCLFight } from './Fight';
import { PetInfo } from './Pet';
import { PlayerInfo } from './Player';

export interface ExportedCharacter {
  id: number;
  name: string;
  server: string;
  region: string;
}

export interface WCLReport {
  fights: WCLFight[];
  lang: string;
  friendlies: PlayerInfo[];
  enemies: EnemyInfo[];
  friendlyPets: PetInfo[];
  enemyPets: PetInfo[];
  phases: unknown[];
  logVersion: number;
  gameVersion: number;
  title: string;
  owner: string;
  start: number;
  end: number;
  zone: number;
  exportedCharacters: ExportedCharacter[];
}

// TODO: refactor code away
export interface Report extends WCLReport {
  code: string;
}

export default Report;
