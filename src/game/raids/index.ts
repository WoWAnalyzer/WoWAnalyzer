import { Spec } from 'game/SPECS';
import { Race } from 'game/RACES';
import PhaseConfig from 'parser/core/PhaseConfig';
import MythicPlusSeasonOne from 'game/raids/mythicplusseasonone';
import NerubarPalace from 'game/raids/nerubarpalace';
import {
  bot as BastionOfTwilight,
  bwd as BlackwingDescent,
  totfw as ThroneOfTheFourWinds,
} from 'game/raids/cata_bwd_bot_totfw';
import Firelands from 'game/raids/cata_firelands';

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
  // The War Within
  MythicPlusSeasonOne,
};

const raids = {
  NerubarPalace, // TWW S1
  // Cataclysm (Classic)
  BlackwingDescent,
  BastionOfTwilight,
  ThroneOfTheFourWinds,
  Firelands,
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
