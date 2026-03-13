import Spell from '../Spell';

const Flasks = {
  FLASK_OF_THALASSIAN_RESISTANCE: {
    id: 1235057,
    name: 'Flask of Thalassian Resistance',
    icon: 'inv_12_profession_alchemy_flask_sindoreipotion_yellow',
  },
  FLASK_OF_THE_MAGISTERS: {
    id: 1235108,
    name: 'Flask of the Magisters',
    icon: 'inv_12_profession_alchemy_flask_sindoreipotion_black',
  },
  FLASK_OF_THE_BLOOD_KNIGHTS: {
    id: 1235110,
    name: 'Flask of the Blood Knights',
    icon: 'inv_12_profession_alchemy_flask_sindoreipotion_white-',
  },
  FLASK_OF_THE_SHATTERED_SUN: {
    id: 1235111,
    name: 'Flask of the Shattered Sun',
    icon: 'inv_12_profession_alchemy_flask_sindoreipotion_red--',
  },
} satisfies Record<string, Spell>;

export default Flasks;
