import ITEMS from 'common/ITEMS/classic';

const ITEM_BUFFS = Object.entries(ITEMS).reduce((result, [str, obj]) => {
  const buffId = 'buffId' in obj ? obj.buffId : null;
  const buffName = 'buffName' in obj ? obj.buffName : null;
  if (buffId && buffName) {
    if (!(buffId in result)) {
      Object.assign(result, { [buffId]: buffName });
    }
  }
  return result;
}, {});

export default ITEM_BUFFS;
