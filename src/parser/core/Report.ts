import { EnemyInfo } from './Enemy';
import { WCLFight } from './Fight';
import { PetInfo } from './Pet';
import { PlayerInfo } from './Player';

/** Identifies the backing source without coupling parser domain types to an adapter. */
export type ReportSource =
  | { kind: 'warcraft-logs'; code: string; isAnonymous: boolean }
  | { kind: 'local'; id: string };

interface ExportedCharacter {
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
  phases: WCLReportPhases[];
  logVersion: number;
  gameVersion: number;
  title: string;
  owner: string;
  start: number;
  end: number;
  zone: number;
  exportedCharacters: ExportedCharacter[];
}

interface WCLReportPhases {
  boss: number;
  /**
   * This is present for all games, but only used for FFXIV as far as I know. We can safely ignore it (for now).
   */
  separatesWipes: boolean;
  /**
   * Phase names.
   */
  phases: Record<number, string>;
  intermissions?: number[];
}

export interface Report extends WCLReport {
  code: string;
  isAnonymous: boolean;
  /** Source identity. Kept optional for compatibility with parser fixtures. */
  locator?: ReportSource;
}

export default Report;
