import { Race } from 'parser/core/Combatant';
import { Spec } from 'game/SPECS';

interface Raid {
  bosses: Boss[],
}
export type Boss = {
  id: number,
  name: string,
  background?: string,
  backgroundPosition?: string,
  headshot?: string,
  icon?: string,
  fight: EncounterConfig,
}
type EncounterConfig = {
  vantusRuneBuffId?: number,
  softMitigationChecks?: {
    physical: [],
    magical: [],
  },
  resultsWarning?: string;
  phases?: { [key: string]: PhaseConfig },
  raceTranslation?: (race: Race, spec: Spec) => Race,
  disableDeathSuggestion?: boolean,
  disableDowntimeSuggestion?: boolean,
  disableDowntimeStatistic?: boolean,
}
export interface PhaseConfig {
  name: string,
  key: string,
  difficulties: number[],
  filter?: unknown,
  multiple?: boolean,
  instance?: number,
}
export interface Phase extends PhaseConfig {
  start: number[],
  end: number[],
}

const raids = {
  // Battle for Azeroth
  Dungeons: require('./dungeons').default,
  CastleNathria: require('./castlenathria').default, //tier 26
};
export default raids;

export function findByBossId(id: number): Boss | null {
  let boss: Boss | null = null;
  Object.values(raids).some((raid: Raid) => {
    const match = Object.values(raid.bosses).find(boss => boss.id === id);
    if (match) {
      boss = match;
      return true;
    }
    return false;
  });
  return boss;
}
