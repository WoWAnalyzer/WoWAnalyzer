import { Race } from 'parser/core/Combatant';

interface Raid {
  bosses: Array<Boss>,
}
export type Boss = {
  id: number,
  name: string,
  background?: string,
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
  phases?: { [key: string]: PhaseConfig },
  raceTranslation?: (race: Race, spec: any) => Race,
  disableDeathSuggestion?: boolean,
  disableDowntimeSuggestion?: boolean,
}
export interface PhaseConfig {
  name: string,
  key: string,
  difficulties: number[],
  filter?: any,
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
  Uldir: require('./uldir').default, // tier 22
  BattleOfDazaralor: require('./battleofdazaralor').default, // tier 23
  CrucibleOfStorms: require('./crucibleofstorms').default, //tier 23.5
  AzsharasEternalPalace: require('./azsharaseternalpalace').default, //tier 24
  NyalothaTheWakingCity: require('./nyalothathewakingcity').default, //tier 25
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
