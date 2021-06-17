const legendaries = {
  //region Balance

  BALANCE_OF_ALL_THINGS_LUNAR: {
    id: 339946,
    name: 'Balance of All Things',
    icon: 'ability_druid_balanceofpower',
    bonusID: 7107,
  },

  BALANCE_OF_ALL_THINGS_SOLAR: {
    id: 339943,
    name: 'Balance of All Things',
    icon: 'ability_druid_balanceofpower',
    bonusID: 7107,
  },
  //endregion

  //region Feral
  FRENZYBAND: {
    id: 340053,
    name: 'Frenzyband',
    icon: 'ability_deathwing_bloodcorruption_earth',
    bonusID: 7109,
  },
  APEX_PREDATORS_CRAVING: {
    id: 339139,
    name: "Apex Predator's Craving",
    icon: 'ability_druid_primaltenacity',
    bonusID: 7091,
  },
  //endregion

  //region Guardian
  URSOCS_FURY_REMEMBERED: {
    id: 339056,
    name: "Ursoc's Fury Remembered",
    icon: 'achievement_emeraldnightmare_ursoc',
  },
  LEGACY_OF_THE_SLEEPER: {
    id: 339062,
    name: 'Legacy of the Sleeper',
    icon: 'inv_hand_1h_artifactursoc_d_01',
  },
  THE_NATURAL_ORDERS_WILL: {
    id: 339063,
    name: "The Natural Order's Will",
    icon: 'ability_druid_fortifiedbark',
  },
  LUFFA_INFUSED_EMBRACE: {
    id: 339060,
    name: 'Luffa-Infused Embrace',
    icon: 'inv_misc_herb_nightmarevine_stem',
  },
  //endregion

  //region Restoration
  VISION_OF_UNENDING_GROWTH: {
    id: 338832,
    name: 'Vision of Unending Growth',
    icon: 'achievement_dungeon_everbloom',
    bonusID: 7099,
  },
  THE_DARK_TITANS_LESSON: {
    id: 338831,
    name: "The Dark Titan's Lesson",
    icon: 'spell_druid_germination_rejuvenation',
  },
  LIFEBLOOM_DTL_HOT_HEAL: {
    // with The Dark Titan's Lesson legendary, BOTH lifeblooms will have this ID
    id: 188550,
    name: 'Lifebloom',
    icon: 'inv_misc_herb_felblossom',
    manaCost: 800,
    bonusID: 7097,
  },
  MEMORY_OF_THE_MOTHER_TREE: {
    id: 189877,
    name: 'Memory of the Mother Tree',
    icon: 'spell_druid_rampantgrowth',
    bonusID: 7096,
  },
  VERDANT_INFUSION: {
    id: 338829,
    name: 'Verdant Infusion',
    icon: 'inv_relics_totemoflife',
    bonusID: 7098,
  },
  //endregion

  //region Shared
  CIRCLE_OF_LIFE_AND_DEATH: {
    id: 338657,
    name: 'Circle of Life and Death',
    icon: 'ability_druid_cyclone',
  },
  DRAUGHT_OF_DEEP_FOCUS: {
    id: 338658,
    name: 'Draught of Deep Focus',
    icon: 'trade_alchemy_dpotion_d12',
    bonusID: 7086,
  },
  OATH_OF_THE_ELDER_DRUID: {
    id: 338608,
    name: 'Oath of the Elder Druid',
    icon: 'spell_holy_blessingofagility',
  },
  LYCARAS_FLEETING_GLIMPSE: {
    id: 340059,
    name: "Lycara's Fleeting Glimpse",
    icon: 'spell_unused',
    bonusID: 7110,
  },

  //endregion
} as const;
export default legendaries;
