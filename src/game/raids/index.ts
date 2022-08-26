/* eslint-disable @typescript-eslint/no-var-requires */
import { Spec } from 'game/SPECS';
import { Race } from 'parser/core/Combatant';
import PhaseConfig from 'parser/core/PhaseConfig';

interface EncounterConfig {
  vantusRuneBuffId?: number;
  softMitigationChecks?: {
    physical: [];
    magical: [];
  };
  resultsWarning?: string;
  phases?: { [key: string]: PhaseConfig };
  raceTranslation?: (race: Race, spec?: Spec) => Race;
  disableDeathSuggestion?: boolean;
  disableDowntimeSuggestion?: boolean;
  disableDowntimeStatistic?: boolean;
}
export interface Boss {
  id: number;
  name: string;
  background?: string;
  backgroundPosition?: string;
  headshot?: string;
  icon?: string;
  fight: EncounterConfig;
}
interface Raid {
  bosses: Boss[];
}
export interface Phase extends PhaseConfig {
  start: number[];
  end: number[];
}
export interface Dungeon {
  id: number;
  name: string;
  background?: string;
  backgroundPosition?: string;
  headshot?: string;
  icon?: string;
  fight: unknown;
}

const raids = {
  // Battle for Azeroth
  Dungeons: require('./dungeons').default,
  CastleNathria: require('./castlenathria').default, //tier 26
  SanctumOfDomination: require('./sanctumofdomination').default, //tier 27
  SepulcherOfTheFirstOnes: require('./sepulcher').default, //tier 28
  // The Burning Cursage
  GruulsLair: require('./gruulslair').default, //tier 4
  MagtheridonsLair: require('./magtheridonslair').default, //tier 4
};
export default raids;

export function findByBossId(id: number): Boss | null {
  let boss: Boss | null = null;
  Object.values(raids).some((raid: Raid) => {
    const match = Object.values(raid.bosses).find((boss) => boss.id === id);
    if (match) {
      boss = match;
      return true;
    }
    return false;
  });
  return boss;
}
