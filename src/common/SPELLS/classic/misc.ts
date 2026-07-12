import Spell from '../Spell';

const spells = {
  // Available to all classes/professions, not tied to any one spec.
  LIFEBLOOD: {
    id: 121279,
    name: 'Lifeblood',
    icon: 'spell_nature_wispsplodegreen.jpg', // Herbalism ability
  },
  GOBLIN_GLIDER: {
    id: 126389,
    name: 'Goblin Glider',
    icon: 'inv_misc_clothscrap_01.jpg',
  },
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
  VENGEANCE_BUFF: {
    id: 132365,
    name: 'Vengeance',
    icon: 'spell_shadow_charm.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
