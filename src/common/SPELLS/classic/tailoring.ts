import Spell from '../Spell';

const spells = {
  LIGHTWEAVE_BUFF_RANK_1: {
    id: 55637,
    name: 'Lightweave Rank 1',
    icon: 'spell_arcane_prismaticcloak.jpg',
    enchantId: 3722,
  },
  LIGHTWEAVE_BUFF_RANK_2: {
    id: 75170,
    name: 'Lightweave Rank 2',
    icon: 'spell_arcane_prismaticcloak.jpg',
    enchantId: 4115,
  },
} satisfies Record<string, Spell>;

export default spells;
