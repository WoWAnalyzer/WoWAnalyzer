import Spell from '../Spell';

const embellishments = {
  /** Darkmoon Sigil: Hunt — grants 56 secondary stats for 15s based on target creature type */
  HASTY_HUNT: {
    id: 1252486,
    name: 'Hasty Hunt',
    icon: 'inv_eyeofnzothpet',
  },
  FOCUSED_HUNT: {
    id: 1252487,
    name: 'Focused Hunt',
    icon: 'inv_eyeofnzothpet',
  },
  MASTERFUL_HUNT: {
    id: 1252488,
    name: 'Masterful Hunt',
    icon: 'inv_eyeofnzothpet',
  },
  VERSATILE_HUNT: {
    id: 1252489,
    name: 'Versatile Hunt',
    icon: 'inv_eyeofnzothpet',
  },
} satisfies Record<string, Spell>;

export default embellishments;
