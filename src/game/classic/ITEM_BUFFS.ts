import ITEMS from 'common/ITEMS/classic';

const ITEM_BUFFS = Object.entries(ITEMS).reduce((result, [str, obj]) => {
  const buffId = obj.buffId || null;
  if (buffId) {
    if (!(buffId in result)) {
      Object.assign(result, { [buffId]: obj.buffName });
    }
  }
  return result;
}, {});

export default ITEM_BUFFS;
