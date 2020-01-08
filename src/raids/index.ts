interface Raid {
  bosses: Array<Boss>,
}

type Boss = {
  id: number,
  fight: any,

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

export function findByBossId(id:number) : Boss|null {
  let boss = null;
  Object.values(raids).some((raid: Raid) => {
    boss = Object.values(raid.bosses).find(boss => boss.id === id);
    return !!boss; // this breaks the loop early once we find a boss
  });
  return boss;
}
