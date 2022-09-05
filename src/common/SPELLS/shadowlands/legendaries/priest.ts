const legendaries = {
  //region Discipline
  // https://www.warcraftlogs.com/reports/khGwRjZaqWvYbK3m#fight=33&type=healing&source=137
  THE_PENITENT_ONE: {
    id: 336011,
    name: 'The Penitent One',
    icon: 'spell_holy_penance',
    bonusID: 6976,
  },
  CLARITY_OF_MIND: {
    id: 336067,
    name: 'Clarity of Mind',
    icon: 'spell_holy_spiritualguidence',
    bonusID: 6980,
  },

  THE_PENITENT_ONE_BUFF: {
    id: 336009,
    name: 'The Penitent One',
    icon: 'spell_holy_penance',
  },
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
  FLASH_CONCENTRATION_ITEM: {
    id: 336266,
    name: 'Flash Concentration',
    icon: 'ability_priest_flashoflight',
    bonusID: 6974,
  },
  FLASH_CONCENTRATION: {
    id: 336267,
    name: 'Flash Concentration',
    icon: 'ability_priest_flashoflight',
  },
  //endregion
  // https://www.warcraftlogs.com/reports/NKcbdPzMXRJ1Drk6#fight=9&type=damage-done&source=11
  ETERNAL_CALL_TO_THE_VOID: {
    id: 336214,
    name: 'Eternall Call to the Void',
    icon: 'achievement_boss_yoggsaron_01',
    bonusID: 6983,
  },
  ETERNAL_CALL_TO_THE_VOID_MIND_FLAY_DAMAGE: {
    id: 193473,
    name: 'Mind Flay',
    icon: 'spell_shadow_siphonmana',
  },
  ETERNAL_CALL_TO_THE_VOID_MIND_SEAR_DAMAGE: {
    id: 344752,
    name: 'Mind Sear',
    icon: 'spell_shadow_siphonmana',
  },
  // https://www.warcraftlogs.com/reports/NKcbdPzMXRJ1Drk6#fight=9&type=damage-done&source=6
  TALBADARS_STRATAGEM: {
    id: 342415,
    name: "Talbadar's Stratagem",
    icon: 'spell_fire_twilightcano',
    bonusID: 7162,
  },
  //region Shadow

  //endregion

  //region Shared
  TWINS_OF_THE_SUN_PRIESTESS: {
    id: 336897,
    name: 'Twins of the Sun Priestess',
    icon: 'spell_fire_felflamering_red',
    bonusID: 7002,
  },

  SHADOW_WORD_MANIPULATION: {
    id: 356392,
    name: 'Shadow Word: Manipulation',
    icon: 'ability_revendreth_priest',
    bonusID: 7704,
  },

  SHADOW_WORD_MANIPULATION_BUFF: {
    id: 357028,
    name: 'Shadow Word: Manipulation',
    icon: 'ability_revendreth_priest',
  },
  //endregion
} as const;
export default legendaries;
