// WCL properties
export interface WCLDungeonPull {
  id: number;
  boss: number;
  start_time: number;
  end_time: number;
  name: string;
  kill?: boolean;
  enemyNPCs?: WCLDungeonPullEnemy[];
}

export interface WCLDungeonPullEnemy {
  id: number;
  gameID: number;
  minimumInstanceID: number;
  maximumInstanceID: number;
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

  /**
   * The actual amount of enemy forces count reached by killing non-boss enemies in a Mythic+ dungeon.
   */
  countReached?: number | null;
  /**
   * The required amount of enemy forces count to reach 100%.
   */
  countRequired?: number | null;
  /**
   * The amount of count provided for different NPCs by game ID. Because JSON, the actual keys after parse are strings.
   */
  npcCountMap?: Record<number | string, number>;
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

  offset_time: number;

  original_end_time?: number;
}

export default Fight;
