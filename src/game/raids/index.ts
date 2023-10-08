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
  // Dragonflight
  MythicPlusSeasonOne: require('./mythicplusseasonone').default,
  MythicPlusSeasonTwo: require('./mythicplusseasontwo').default,
  VaultOfTheIncarnates: require('./vaultoftheincarnates').default, // tier 29
  Aberrus: require('./aberrus').default, // tier 30
  // The Burning Cursage
  GruulsLair: require('./gruulslair').default, // tier 4
  MagtheridonsLair: require('./magtheridonslair').default, // tier 4
  // Wrath of the Lich King (Classic)
  Ulduar: require('./ulduar').default, // tier 8
  TrialOfTheGrandCrusader: require('./trialofthegrandcrusader').default, // tier 9
  IcecrownCitadel: require('./icc').default, // tier 10
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
