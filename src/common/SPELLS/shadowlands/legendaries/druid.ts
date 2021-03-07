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

  //endregion

  //region Guardian

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
  //endregion

  //region Shared

  //endregion
} as const;
export default legendaries;
