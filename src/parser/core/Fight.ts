// WCL properties
interface WCLDungeonPull {
  id: number;
  boss: number;
  start_time: number;
  end_time: number;
  name: string;
  kill?: boolean;
  enemies?: number[][];
}

export interface WCLFight {
  id: number;
  start_time: number;
  end_time: number;
  boss: number;
  /**
   * Set on fast wipe pulls (e.g. resets) and on trash "RP" fights when `boss`
   * has been overridden to 0.
   */
  originalBoss?: number;
  name: string;
  size?: number;
  difficulty?: number;
  kill?: boolean;
  bossPercentage?: number;
  fightPercentage?: number;
  hardModeLevel?: number;
  dungeonPulls?: WCLDungeonPull[];
  phases?: WCLPhaseTransition[];
}

interface WCLPhaseTransition {
  /**
   * The id of the phase. 1-indexed, names are stored in `WCLReport.phases`.
   */
  id: number;
  startTime: number;
}

//generated or applied properties
export interface Fight extends WCLFight {
  filtered?: boolean;
  phase?: string;
  instance?: number;
  // eslint-disable-next-line camelcase
  offset_time: number;
  // eslint-disable-next-line camelcase
  original_end_time?: number;
}

export default Fight;
