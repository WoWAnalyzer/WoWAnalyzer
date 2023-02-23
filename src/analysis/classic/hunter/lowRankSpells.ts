import SPELLS from 'common/SPELLS/classic/hunter';

const lowRankSpells = Object.entries(SPELLS).reduce((result, [str, obj]) => {
  if (obj.lowRanks) {
    // handle rank 4 and rank 3 low level spell allowed/encouraged in WoTLK
    if (obj.id === SPELLS.EXPLOSIVE_SHOT.id) {
      return result;
    } else {
      Object.assign(result, { [obj.id]: [...obj.lowRanks] });
    }
  }
  return result;
}, {});

export default lowRankSpells;

export interface LowRankSpells {
  [primarySpellId: number]: number[];
}
