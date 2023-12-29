import { Spec } from 'game/SPECS';
import { Race } from 'parser/core/Combatant';
import PhaseConfig from 'parser/core/PhaseConfig';
import MythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import MythicPlusSeasonTwo from 'game/raids/mythicplusseasontwo';
import MythicPlusSeasonThree from 'game/raids/mythicplusseasonthree';
import VaultOfTheIncarnates from 'game/raids/vaultoftheincarnates';
import Aberrus from 'game/raids/aberrus';
import Amirdrassil from 'game/raids/amirdrassil';
import Ulduar from 'game/raids/ulduar';
import TrialOfTheGrandCrusader from 'game/raids/trialofthegrandcrusader';
import IcecrownCitadel from 'game/raids/icc';
import RubySanctum from 'game/raids/rubysanctum';

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

interface Encounter {
  id: number;
  name: string;
  background?: string;
  backgroundPosition?: string;
  headshot?: string;
  icon?: string;
}

export interface Boss extends Encounter {
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

export const dungeons = {
  // Dragonflight
  MythicPlusSeasonOne,
  MythicPlusSeasonTwo,
  MythicPlusSeasonThree,
};

const raids = {
  VaultOfTheIncarnates, // tier 29
  Aberrus, // tier 30
  Amirdrassil, // tier 31
  // Wrath of the Lich King (Classic)
  Ulduar, // tier 8
  TrialOfTheGrandCrusader, // tier 9
  IcecrownCitadel, // tier 10
  RubySanctum, // tier 11
};
export default raids;

export function findByDungeonBossId(id: number) {
  return Object.values(dungeons)
    .flatMap((dungeon) => Object.values(dungeon.bosses))
    .find((boss) => boss.id === id);
}

export function findByRaidBossId(id: number) {
  return Object.values(raids)
    .flatMap((raid) => Object.values(raid.bosses))
    .find((boss) => boss.id === id);
}

export function findByBossId(id: number) {
  return findByRaidBossId(id) ?? findByDungeonBossId(id) ?? null;
}
