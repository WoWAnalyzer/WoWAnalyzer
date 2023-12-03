import ITEMS from 'common/ITEMS/classic';

const ITEM_BUFFS = Object.entries(ITEMS).reduce((result, [str, obj]) => {
  const buffs = 'buffs' in obj ? obj.buffs : null;
  if (buffs) {
    buffs.forEach((buff) => Object.assign(result, { [buff.id]: buff.name }));
  }
  return result;
}, {});

export default ITEM_BUFFS;
