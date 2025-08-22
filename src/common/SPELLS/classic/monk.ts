import type Spell from '../Spell';

const spells = {
  GIFT_OF_THE_OX_SPAWN_1: { id: 124503, name: 'Gift of the Ox', icon: 'inv_misc_gem_pearl_13.jpg' },
  GIFT_OF_THE_OX_SPAWN_2: { id: 124506, name: 'Gift of the Ox', icon: 'inv_misc_gem_pearl_13.jpg' },
  JAB_2H: { id: 115698, name: 'Jab', icon: 'inv_spear_03.jpg' },
  JAB_1H: { id: 100780, name: 'Jab', icon: 'ability_monk_jab.jpg' },
  FISTS_OF_FURY_TICK: { id: 117418, name: 'Fists of Fury', icon: 'monk_ability_fistoffury.jpg' },
  SPEAR_HAND_STRIKE_SILENCE: {
    id: 116709,
    name: 'Spear Hand Strike',
    icon: 'ability_monk_spearhand.jpg',
  },
  SHUFFLE: {
    id: 115307,
    name: 'Shuffle',
    icon: 'ability_monk_shuffle.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
