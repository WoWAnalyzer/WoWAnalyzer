import SPELLS from 'common/SPELLS/classic/hunter';

const lowRankSpells = Object.entries(SPELLS).reduce((result, [str, obj]) => {
  if (obj.lowRanks) {
    Object.assign(result, { [obj.id]: [...obj.lowRanks] });
  }
  return result;
}, {});

export default lowRankSpells;

export interface LowRankSpells {
  [primarySpellId: number]: number[];
}
