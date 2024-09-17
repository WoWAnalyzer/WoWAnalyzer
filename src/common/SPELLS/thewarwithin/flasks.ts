import Spell from '../Spell';

const Flasks = {
  FLASK_OF_ALCHEMICAL_CHAOS: {
    id: 432021,
    name: 'Flask of Alchemical Chaos',
    icon: 'inv_potion_orange',
  },
  FLASK_OF_TEMPERED_AGGRESSION: {
    id: 431971,
    name: 'Flask of Alchemical Aggression',
    icon: 'inv_potion_red',
  },
  FLASK_OF_TEMPERED_SWIFTNESS: {
    id: 431972,
    name: 'Flask of Alchemical Swiftness',
    icon: 'inv_potion_green',
  },
  FLASK_OF_TEMPERED_VERSATILITY: {
    id: 431973,
    name: 'Flask of Alchemical Versatility',
    icon: 'inv_potion_blue',
  },
  FLASK_OF_TEMPERED_MASTERY: {
    id: 431974,
    name: 'Flask of Alchemical Mastery',
    icon: 'inv_potion_purple',
  },
} satisfies Record<string, Spell>;

export default Flasks;
