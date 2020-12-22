const legendaries = {
  //region Discipline

  //endregion

  //region Holy
  // https://www.warcraftlogs.com/reports/r3RHf1MNpwCk2Z6t#fight=last&type=summary&source=14
  HARMONIOUS_APPARATUS: {
    id: 336314,
    name: 'Harmonious Apparatus',
    icon: 'spell_holy_serendipity',
    bonusID: 6977,
  },
  // https://www.warcraftlogs.com/reports/Nbgx2m1ZWFtLvDyc#fight=1&source=4&type=summary
  DIVINE_IMAGE: {
    id: 336400,
    name: 'Divine Image',
    icon: 'inv_pet_naaru',
    bonusID: 6973,
  },
  //endregion

  //region Shadow

  //endregion

  //region Shared

  //endregion
} as const;
export default legendaries;
