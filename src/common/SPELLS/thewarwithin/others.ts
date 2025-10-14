import Spell from '../Spell';

const others = {
  CRYSTALLIZED_AUGMENT_RUNE: {
    id: 453250,
    name: 'Crystallized Augment Rune',
    icon: 'inv_10_enchanting_crystal_color5',
  },
  PHASE_BLINK: {
    id: 1220679,
    name: 'Phase Blink',
    icon: 'spell_arcane_prismaticcloak',
  },
} satisfies Record<string, Spell>;

export default others;
