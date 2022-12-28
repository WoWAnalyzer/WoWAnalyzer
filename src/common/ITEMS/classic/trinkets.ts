import { itemIndexableList } from 'common/ITEMS/Item';

const items = itemIndexableList({
  // Dying Curse - https://www.wowhead.com/wotlk/item=40255
  DYING_CURSE_BUFF: {
    id: 60494,
    name: 'Dying Curse',
    icon: 'spell_holy_mindvision',
  },
  // Embrace of the Spider - https://www.wowhead.com/wotlk/item=39229
  EMBRACE_SPIDER_BUFF: {
    id: 60492,
    name: 'Embrace of the Spider',
    icon: 'spell_holy_searinglight',
  },
  // Illustration of the Dragon Soul - https://www.wowhead.com/wotlk/item=40432
  ILLUSTRATION_DRAGON_SOUL_BUFF: {
    id: 60486,
    name: 'Illustration of the Dragon Soul',
    icon: 'inv_offhand_hyjal_d_01',
  },
  // Sundial of the Exiled - https://www.wowhead.com/wotlk/item=40682
  SUNDIAL_BUFF: {
    id: 60064,
    name: 'Now is the time!',
    icon: 'ability_hunter_readiness',
  },
});

export default items;
