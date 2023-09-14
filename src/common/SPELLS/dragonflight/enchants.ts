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
} satisfies Record<string, Spell>;

export default enchants;
