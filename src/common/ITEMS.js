import indexById from './indexById';

import ITEMS_OTHERS from './ITEMS_OTHERS';

import ITEMS_DEATH_KNIGHT from './ITEMS_DEATH_KNIGHT';
import ITEMS_DEMON_HUNTER from './ITEMS_DEMON_HUNTER';
import ITEMS_DRUID from './ITEMS_DRUID';
import ITEMS_HUNTER from './ITEMS_HUNTER';
import ITEMS_MAGE from './ITEMS_MAGE';
import ITEMS_MONK from './ITEMS_MONK';
import ITEMS_PALADIN from './ITEMS_PALADIN';
import ITEMS_PRIEST from './ITEMS_PRIEST';
import ITEMS_ROGUE from './ITEMS_ROGUE';
import ITEMS_SHAMAN from './ITEMS_SHAMAN';
import ITEMS_WARLOCK from './ITEMS_WARLOCK';
import ITEMS_WARRIOR from './ITEMS_WARRIOR';

function merge(...args) {
  const obj = {};
  args.forEach(arg => {
    Object.keys(arg).forEach(key => {
      if (process.env.NODE_ENV === 'development') {
        if (obj[key]) {
          throw new Error('An item with this key already exists:' + key);
        }
      }
      obj[key] = arg[key];
    });
  });
  return obj;
}

const ITEMS = {
  ...merge(
    ITEMS_OTHERS,
    ITEMS_DEATH_KNIGHT,
    ITEMS_DEMON_HUNTER,
    ITEMS_DRUID,
    ITEMS_HUNTER,
    ITEMS_MAGE,
    ITEMS_MONK,
    ITEMS_PALADIN,
    ITEMS_PRIEST,
    ITEMS_ROGUE,
    ITEMS_SHAMAN,
    ITEMS_WARLOCK,
    ITEMS_WARRIOR
  ),
};

export default indexById(ITEMS);
