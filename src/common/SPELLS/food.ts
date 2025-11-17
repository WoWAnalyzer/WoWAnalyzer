import Spell from 'common/SPELLS/Spell';

const food = {
  // region Earthen racial food buffs
  EARTHEN_WELL_FED_HASTE: {
    id: 451916,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  EARTHEN_WELL_FED_VERS: {
    id: 451917,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  EARTHEN_WELL_FED_CRIT: {
    id: 451918,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  EARTHEN_WELL_FED_MASTERY: {
    id: 451920,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  // endregion Earthen racial food buffs
} satisfies Record<string, Spell>;

export default food;
