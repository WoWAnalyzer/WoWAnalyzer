import Spell from '../Spell';

const embellishments = {
  DARKMOON_SIGIL_ASCENSION_CRIT: {
    id: 458502,
    name: 'Ascendance',
    icon: 'inv_inscriptions_darkmoondeckevolution_0',
  },
  DARKMOON_SIGIL_ASCENSION_HASTE: {
    id: 458503,
    name: 'Ascendance',
    icon: 'inv_inscriptions_darkmoondeckevolution_0',
  },
  DARKMOON_SIGIL_ASCENSION_MASTERY: {
    id: 458525,
    name: 'Ascendance',
    icon: 'inv_inscriptions_darkmoondeckevolution_0',
  },
  DARKMOON_SIGIL_ASCENSION_VERSATILITY: {
    id: 458524,
    name: 'Ascendance',
    icon: 'inv_inscriptions_darkmoondeckevolution_0',
  },
} satisfies Record<string, Spell>;

export default embellishments;
