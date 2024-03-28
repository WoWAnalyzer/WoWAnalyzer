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

export interface Raid {
  name: string;
  background?: string;
  bosses: Record<string, Boss>;
}

export interface Phase extends PhaseConfig {
  start: number[];
  end: number[];
}

const raids = {
  // Dragonflight
  MythicPlusSeasonOne: require('./mythicplusseasonone').default,
  MythicPlusSeasonTwo: require('./mythicplusseasontwo').default,
  MythicPlusSeasonThree: require('./mythicplusseasonthree').default,
  MythicPlusSeasonFour: require('./mythicplusseasonfour').default,
  VaultOfTheIncarnates: require('./vaultoftheincarnates').default, // tier 29
  Aberrus: require('./aberrus').default, // tier 30
  Amirdrassil: require('./amirdrassil').default, // tier 31
  // Wrath of the Lich King (Classic)
  Ulduar: require('./ulduar').default, // tier 8
  TrialOfTheGrandCrusader: require('./trialofthegrandcrusader').default, // tier 9
  IcecrownCitadel: require('./icc').default, // tier 10
  RubySanctum: require('./rubysanctum').default, // tier 11
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
