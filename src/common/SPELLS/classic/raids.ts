import Spell from '../Spell';

const spells = {
  // -----------------
  // CATA - Tier 11
  // -----------------
  // Cho'gall
  CORRUPTION_ABSOLUTE: {
    id: 82170,
    name: 'Corruption: Absolute',
    icon: 'ability_warlock_eradication.jpg',
  },
  // Nefarian
  FREE_YOUR_MIND: {
    id: 79323,
    name: 'Free Your Mind',
    icon: 'spell_arcane_mindmastery.jpg',
  },
  SIPHON_POWER: {
    id: 79319,
    name: 'Siphon Power',
    icon: 'spell_arcane_focusedpower.jpg',
  },
  // Sinestra
  ESSENCE_OF_THE_RED: {
    id: 87946,
    name: 'Essence of the Red',
    icon: 'spell_fire_lavaspawn.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
