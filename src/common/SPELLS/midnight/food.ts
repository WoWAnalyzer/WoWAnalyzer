import Spell from '../Spell';

const food = {
  // #region Starter 25 Primary Stat
  HEARTY_WELL_FED_25_PRIMARY: {
    id: 1233714,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_25_PRIMARY: {
    id: 1232325,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Starter 25 Primary Stat

  // #region Starter Dual Secondary Stat
  FARSTRIDER_RATIONS: {
    id: 1232316,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_FARSTRIDER_RATIONS: {
    id: 1233708,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  FORAGERS_MEDLEY: {
    id: 1232318,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_FORAGERS_MEDLEY: {
    id: 1233710,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  PORTABLE_SNACK: {
    id: 1232313,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_PORTABLE_SNACK: {
    id: 1233707,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  QUICK_SANDWICH: {
    id: 1232317,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_QUICK_SANDWICH: {
    id: 1233709,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  SILVERMOON_STANDARD: {
    id: 1232320,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_SILVERMOON_STANDARD: {
    id: 1233711,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  SPICED_BISCUITS: {
    id: 1232321,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_SPICED_BISCUITS: {
    id: 1233712,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Starter Dual Secondary Stat

  // #region Intermediate 35 Primary Stat
  WELL_FED_35_PRIMARY: {
    id: 1233407,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_35_PRIMARY: {
    id: 1233732,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Intermediate 35 Primary Stat

  /** 46 Versatility */
  FELBERRY_FIGS: {
    id: 1283372,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_FELBERRY_FIGS: {
    id: 1284650,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },

  // #region Intermediate Dual Secondary
  BLOODTHISTLE_WRAPPED_CUTLETS: {
    id: 1233400,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_BLOODTHISTLE_WRAPPED_CUTLETS: {
    id: 1233726,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  EVERSONG_PUDDING: {
    id: 1233404,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_EVERSONG_PUDDING: {
    id: 1233729,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  FRIED_BLOOMTAIL: {
    id: 1233406,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_FRIED_BLOOMTAIL: {
    id: 1233731,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTHFLAME_SUPPER: {
    id: 1233401,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_HEARTHFLAME_SUPPER: {
    id: 1233727,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  SUNWELL_DELIGHT: {
    id: 1233405,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_SUNWELL_DELIGHT: {
    id: 1233730,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WISE_TAILS: {
    id: 1233402,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WISE_TAILS: {
    id: 1233719,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Intermediate Dual Secondary

  // #region Advanced 59 Secondary Stat
  WELL_FED_59_CRIT: {
    id: 1219183,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_59_CRIT: {
    id: 1284644,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_59_HASTE: {
    id: 1219182,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_59_HASTE: {
    id: 1284643,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_59_MASTERY: {
    id: 1219185,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_59_MASTERY: {
    id: 1284642,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_59_VERSATILITY: {
    id: 1232492,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_59_VERSATILITY: {
    id: 1284641,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Advanced 59 Secondary Stat

  // #region Master 65 Secondary Stat
  WELL_FED_65_CRIT: {
    id: 1284616,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_65_CRIT: {
    id: 1233703,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_65_HASTE: {
    id: 1284617,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_65_HASTE: {
    id: 1233704,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_65_MASTERY: {
    id: 1284618,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_65_MASTERY: {
    id: 1233705,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_65_VERSATILITY: {
    id: 1284619,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_65_VERSATILITY: {
    id: 1233706,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Master 65 Secondary Stat

  // #region  Master 50 Primary Stat
  /** Royal Roast gives the Feast Buff 1232585 instead of 1232324 */
  WELL_FED_50_PRIMARY: {
    id: 1232324,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_50_PRIMARY: {
    id: 1233724,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Master 50 Primary Stat

  // #region Primary Feast
  WELL_FED_STAMINA_PRIMARY_FEAST: {
    id: 1232585,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_STAMINA_PRIMARY_FEAST: {
    id: 1285644,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Primary Feast

  // #region Secondary Feast
  WELL_FED_STAMINA_65_CRIT: {
    id: 1232086,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_STAMINA_65_CRIT: {
    id: 1232076,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_STAMINA_65_HASTE: {
    id: 1232087,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_STAMINA_65_HASTE: {
    id: 1232078,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_STAMINA_65_MASTERY: {
    id: 1232089,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_STAMINA_65_MASTERY: {
    id: 1232080,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  WELL_FED_STAMINA_65_VERSATILITY: {
    id: 1232091,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  HEARTY_WELL_FED_STAMINA_65_VERSATILITY: {
    id: 1232082,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Secondary Feast
} satisfies Record<string, Spell>;

export default food;
