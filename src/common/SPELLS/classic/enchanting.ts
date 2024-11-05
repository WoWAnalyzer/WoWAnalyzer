import { Enchant } from '../Spell';

const spells = {
  POWER_TORRENT_BUFF: {
    id: 74241,
    name: 'Power Torrent',
    icon: 'ability_paladin_sacredcleansing.jpg',
    effectId: 4097,
  },
  HURRICANE_BUFF: {
    id: 74221,
    name: 'Hurricane',
    icon: 'spell_nature_cyclone.jpg',
    effectId: 4083,
  },
} satisfies Record<string, Enchant>;

export default spells;
