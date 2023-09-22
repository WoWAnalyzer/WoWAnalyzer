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
  BURNING_WRIT_BUFF: {
    id: 390165,
    name: 'Burning Writ',
    icon: 'inv_10_elementalshardfoozles_fire',
  },
  EARTHEN_WRIT_BUFF: {
    id: 390170,
    name: 'Earthen Writ',
    icon: 'inv_10_elementalshardfoozles_earth',
  },
  FROZEN_WRIT_BUFF: {
    id: 390242,
    name: 'Frozen Writ',
    icon: 'inv_10_elementalshardfoozles_frost',
  },
  SOPHIC_WRIT_BUFF: {
    id: 390216,
    name: 'Sophic Writ',
    icon: 'inv_10_elementalshardfoozles_titan',
  },
  SOPHIC_DEVOTION_BUFF: {
    id: 390224,
    name: 'Sophic Devotion',
    icon: 'inv_10_elementalcombinedfoozles_titan',
  },
} satisfies Record<string, Spell>;

export default enchants;
