import Spell from '../Spell';

const spells = {
  FLASK_OF_THE_FROST_WYRM: {
    id: 53755,
    name: 'Flask of the Frost Wyrm',
    icon: 'inv_alchemy_endlessflask_04',
  },
  FLASK_OF_ENDLESS_RAGE: {
    id: 53760,
    name: 'Flask of Endless Rage',
    icon: 'inv_alchemy_endlessflask_06',
  },
  FLASK_OF_STONEBLOOD: {
    id: 53758,
    name: 'Flask of Stoneblood',
    icon: 'inv_alchemy_endlessflask_05',
  },
  FLASK_OF_PURE_MOJO: {
    id: 54212,
    name: 'Flask of Pure Mojo',
    icon: 'inv_alchemy_endlessflask_03',
  },
  FLASK_OF_DISTILLED_WISDOM: {
    id: 17627,
    name: 'Flask of Distilled Wisom',
    icon: 'inv_potion_97',
  },
} satisfies Record<string, Spell>;

export default spells;
