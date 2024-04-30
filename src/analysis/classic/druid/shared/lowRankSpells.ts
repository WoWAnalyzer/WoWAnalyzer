import SPELLS from 'common/SPELLS/classic/druid';

const lowRankSpells = Object.entries(SPELLS).reduce((result, [str, obj]) => {
  if ('lowRanks' in obj && obj.lowRanks) {
    Object.assign(result, { [obj.id]: [...obj.lowRanks] });
  }
  return result;
}, {});

export default lowRankSpells;
