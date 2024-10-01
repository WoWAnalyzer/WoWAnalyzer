import Spell from '../../Spell';

const NerubArPalace = {
  ULGRAX_GRAB_VISCERA: {
    name: 'Grab Viscera',
    id: 456757,
    icon: 'spell_shaman_earthquake',
  },
  ULGRAX_FEED: {
    name: 'Feed',
    id: 438324,
    icon: 'ability_racial_cannibalize',
  },
} satisfies Record<string, Spell>;

export default NerubArPalace;
