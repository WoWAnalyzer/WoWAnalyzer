import Spell from '../Spell';

const enchants = {
  WAFTING_DEVOTION: {
    id: 390357,
    name: 'Wafting Devotion',
    icon: 'inv_10_elementalcombinedfoozles_air',
  },
  WAFTING_WRIT: {
    id: 390247,
    name: 'Wafting Writ',
    icon: 'inv_10_elementalshardfoozles_air',
  },
  BURNING_DEVOTION_BUFF: {
    id: 390339,
    name: 'Burning Devotion',
    icon: 'inv_10_elementalcombinedfoozles_fire',
  },
  BURNING_DEVOTION_HEAL: {
    id: 390375,
    name: 'Burning Devotion',
    icon: 'inv_10_elementalcombinedfoozles_fire',
  },
} satisfies Record<string, Spell>;

export default enchants;
