import Spell from '../Spell';

const spells = {
  NIGHTMARE_SEED: {
    id: 28726,
    name: 'Nightmare Seed',
    icon: 'inv_misc_herb_nightmareseed',
  },
  SHARD_OF_WOE_CELERITY: {
    id: 91173,
    name: 'Celerity',
    icon: 'spell_livegivingspeed',
  },
} satisfies Record<string, Spell>;

export default spells;
