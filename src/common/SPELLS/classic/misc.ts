import Spell from '../Spell';

const spells = {
  GREATER_DRUMS_OF_SPEED: {
    id: 351359,
    name: 'Greater Drums of Speed',
    icon: 'inv_misc_drum_04.jpg',
  },
  NIGHTMARE_SEED: {
    id: 28726,
    name: 'Nightmare Seed',
    icon: 'inv_misc_herb_nightmareseed.jpg',
  },
  SHARD_OF_WOE_CELERITY: {
    id: 91173,
    name: 'Celerity',
    icon: 'spell_livegivingspeed.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
