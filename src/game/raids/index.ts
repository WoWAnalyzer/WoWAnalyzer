import { Spec } from 'game/SPECS';
import { Race } from 'parser/core/Combatant';
import PhaseConfig from 'parser/core/PhaseConfig';
import MythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import MythicPlusSeasonTwo from 'game/raids/mythicplusseasontwo';
import MythicPlusSeasonThree from 'game/raids/mythicplusseasonthree';
import MythicPlusSeasonFour from 'game/raids/mythicplusseasonfour';
import VaultOfTheIncarnates from 'game/raids/vaultoftheincarnates';
import Aberrus from 'game/raids/aberrus';
import Amirdrassil from 'game/raids/amirdrassil';

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

const dungeons = {
  // Dragonflight
  MythicPlusSeasonOne,
  MythicPlusSeasonTwo,
  MythicPlusSeasonThree,
  MythicPlusSeasonFour,
};

const raids = {
  VaultOfTheIncarnates, // tier 29
  Aberrus, // tier 30
  Amirdrassil, // tier 31
  // Cataclysm (Classic)
};

function findByDungeonBossId(id: number) {
  return Object.values(dungeons)
    .flatMap((dungeon) => Object.values(dungeon.bosses))
    .find((boss) => boss.id === id);
}

function findByRaidBossId(id: number) {
  return Object.values(raids)
    .flatMap((raid) => Object.values(raid.bosses))
    .find((boss) => boss.id === id);
}

export function findByBossId(id: number) {
  return findByRaidBossId(id) ?? findByDungeonBossId(id) ?? null;
}
