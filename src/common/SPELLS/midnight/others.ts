import Spell from '../Spell';

const others = {
  VOIDLUST: {
    id: 1277482,
    name: 'Voidlust',
    icon: 'inv_cosmicvoid_buff',
  },
  VOID_TOUCHED: {
    id: 1264426,
    name: 'Void-Touched',
    icon: 'inv_10_enchanting_crystal_color2',
  },
} satisfies Record<string, Spell>;

export default others;
