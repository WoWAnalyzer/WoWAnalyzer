import SPELLS from 'common/SPELLS/classic/warlock';

const lowRankSpells = Object.entries(SPELLS).reduce((result, [str, obj]) => {
  if ('lowRanks' in obj && obj.lowRanks) {
    Object.assign(result, { [obj.id]: [...obj.lowRanks] });
  }
  return result;
}, {});

export default lowRankSpells;

export const whitelist = {
  [SPELLS.LIFE_TAP.id]: [1454],
};
