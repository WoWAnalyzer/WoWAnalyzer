import Spell from '../Spell';

const embellishments = {
  /** Darkmoon Sigil: Hunt — grants 56 secondary stats for 15s based on target creature type */
  DARKMOON_SIGIL_HUNT_HASTE: {
    id: 1252486,
    name: 'Hasty Hunt',
    icon: 'inv_eyeofnzothpet',
  },
  DARKMOON_SIGIL_HUNT_CRIT: {
    id: 1252487,
    name: 'Focused Hunt',
    icon: 'inv_eyeofnzothpet',
  },
  DARKMOON_SIGIL_HUNT_MASTERY: {
    id: 1252488,
    name: 'Masterful Hunt',
    icon: 'inv_eyeofnzothpet',
  },
  DARKMOON_SIGIL_HUNT_VERSATILITY: {
    id: 1252489,
    name: 'Versatile Hunt',
    icon: 'inv_eyeofnzothpet',
  },
} satisfies Record<string, Spell>;

export default embellishments;
