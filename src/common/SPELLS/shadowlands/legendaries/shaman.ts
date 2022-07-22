//https://www.raidbots.com/static/data/live/bonuses.json
const legendaries = {
  //region Enhancement
  ELEMENTAL_CONDUIT: {
    id: 356250,
    name: 'Elemental Conduit',
    icon: 'spell_animarevendreth_beam',
    bonusID: 7709,
  },
  WITCH_DOCTORS_WOLF_BONES: {
    id: 335897,
    name: "Witch Doctor's Wolf Bones",
    icon: 'inv_misc_bone_09',
    bonusID: 6995,
  },
  //endregion

  //region Elemental

  //endregion

  //region Restoration
  JONATS_NATURAL_FOCUS: {
    id: 335893,
    name: "Jonat's Natural Focus",
    icon: 'spell_nature_healingwavegreater',
    bonusID: 6997,
  },
  JONATS_NATURAL_FOCUS_BUFF: {
    id: 335894,
    name: "Jonat's Natural Focus",
    icon: 'spell_nature_healingwavegreater',
  },
  PRIMAL_TIDE_CORE: {
    id: 335889,
    name: 'Primal Tide Core',
    icon: 'ability_shaman_repulsiontotem',
    bonusID: 6999,
  },
  EARTHEN_HARMONY: {
    id: 335886,
    name: 'Earthen Harmony',
    icon: 'item_earthenmight',
    bonusID: 7000,
  },
  //endregion

  //region Shared
  SEEDS_OF_RAMPANT_GROWTH: {
    id: 356218,
    name: 'Seeds of Rampant Growth',
    icon: 'spell_lifegivingseed',
    bonusID: 7708,
  },
  SEEDS_OF_RAMPANT_GROWTH_BUFF: {
    id: 358945,
    name: 'Seeds of Rampant Growth',
    icon: 'spell_lifegivingseed',
  },
  //endregion
} as const;
export default legendaries;
