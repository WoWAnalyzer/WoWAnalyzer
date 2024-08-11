import Spell from '../Spell';

const spells = {
  FLASK_OF_BATTLE: {
    id: 92679,
    name: 'Flask of Battle',
    icon: 'inv_alchemy_endlessflask_05',
  },
  FLASK_OF_FLOWING_WATER: {
    id: 94160,
    name: 'Flask of Flowing Water',
    icon: 'inv_potione_4',
  },
  FLASK_OF_STEELSKIN: {
    id: 79469,
    name: 'Flask of Steelskin',
    icon: 'inv_potione_1',
  },
  FLASK_OF_THE_DRACONIC_MIND: {
    id: 79470,
    name: 'Flask of the Draconic Mind',
    icon: 'inv_potione_5',
  },
  FLASK_OF_THE_WINDS: {
    id: 79471,
    name: 'Flask of the Winds',
    icon: 'inv_potione_2',
  },
  FLASK_OF_TITANIC_STRENGTH: {
    id: 79472,
    name: 'Flask of Titanic Strength',
    icon: 'inv_potione_6',
  },
} satisfies Record<string, Spell>;

export default spells;
