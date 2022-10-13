const legendaries = {
  //region Brewmaster
  CHARRED_PASSIONS_BUFF: {
    id: 386963,
    name: 'Charred Passions',
    icon: 'ability_monk_mightyoxkick',
  },
  CHARRED_PASSIONS_DAMAGE: {
    id: 386959,
    name: 'Charred Passions',
    icon: 'ability_monk_mightyoxkick',
  },
  CELESTIAL_INFUSION: {
    id: 337290,
    name: 'Celestial Infusion',
    icon: 'achievement_faction_brewmaster',
    bonusID: 7078,
  },
  SHAOHAOS_MIGHT: {
    id: 337570,
    name: "Shaohao's Might",
    icon: 'ability_monk_tigerpalm',
    bonusID: 7079,
  },

  //endregion

  //region Mistweaver
  TEAR_OF_MORNING: {
    id: 337473,
    name: 'Tear of Morning',
    icon: 'ability_monk_uplift',
    bonusID: 7072,
  },
  YULONS_WHISPER: {
    id: 337225,
    name: "Yu'lon's Whisper",
    icon: 'ability_monk_dragonkick',
    bonusID: 7073,
  },
  YULON_WHISPER_HEAL: {
    id: 337268,
    name: "Yu'lon's Whisper",
    icon: 'ability_monk_chiexplosion',
  },
  //endregion

  //region Windwalker
  KEEFERS_SKYREACH: {
    id: 337334,
    name: "Keefer's Skyreach",
    icon: 'inv__fistofthewhitetiger',
    bonusID: 7068,
  },
  LAST_EMPERORS_CAPACITOR: {
    id: 337292,
    name: "Last Emperor's Capacitor",
    icon: 'ability_warrior_unrelentingassault',
    bonusID: 7069,
  },
  LAST_EMPERORS_CAPACITOR_BUFF: {
    id: 337291,
    name: "The Emperor's Capcitor",
    icon: 'ability_monk_cracklingjadelightning',
  },
  XUENS_BATTLEGEAR: {
    id: 337481,
    name: "Xuen's Battlegear",
    icon: 'monk_stance_whitetiger',
    bonusID: 7070,
  },
  PRESSURE_POINT: {
    id: 337482,
    name: 'Pressure Point',
    icon: 'spell_monk_windwalker_spec',
  },
  JADE_IGNITION: {
    id: 337483,
    name: 'Jade Ignition',
    icon: 'ability_monk_chiexplosion',
    bonusID: 7071,
  },
  JADE_IGNITION_BUFF: {
    id: 337571,
    name: 'Chi Energy',
    icon: 'ability_monk_chiexplosion',
  },
  JADE_IGNITION_DAMAGE: {
    id: 337342,
    name: 'Chi Explosion',
    icon: 'ability_monk_chiexplosion',
  },

  //endregion

  //region Shared
  SWIFTSURE_WRAPS: {
    id: 337294,
    name: 'Swiftsure Wraps',
    icon: 'ability_monk_roll',
    bonusID: 7080,
  },
  FATAL_TOUCH: {
    id: 337296,
    name: 'Fatal Touch',
    icon: 'ability_monk_touchofdeath',
    bonusID: 7081,
  },
  ESCAPE_FROM_REALITY: {
    id: 343250,
    name: 'Escape from Reality',
    icon: 'monk_ability_transcendence',
    bonusID: 7184,
  },

  //endregion

  // Covenant
  CALL_TO_ARMS: {
    id: 356684,
    name: 'Call to Arms',
    icon: 'ability_bastion_monk',
    bonusID: 7718,
  },
  CTA_INVOKE_NIUZAO_BUFF: {
    id: 358520,
    name: 'Invoke Niuzao, the Black Ox',
    icon: 'spell_monk_brewmaster_spec',
  },
  BOUNTIFUL_BREW: {
    id: 356592,
    name: 'Bountiful Brew',
    icon: 'ability_maldraxxus_monk',
    bonusID: 7707,
  },
  FAELINE_HARMONY: {
    id: 356705,
    name: 'Faeline Harmony',
    icon: 'ability_ardenweald_monk',
    bonusID: 7721,
  },
  FAELINE_HARMONY_DEBUFF: {
    id: 356773,
    name: 'Faeline Exposure Damage',
    icon: 'ability_ardenweald_monk',
  },
  FAELINE_HARMONY_BUFF: {
    id: 356774,
    name: 'Faeline Exposure Healing',
    icon: 'ability_ardenweald_monk',
  },
  SINISTER_TEACHINGS: {
    id: 356818,
    name: 'Sinister Teachings',
    icon: 'ability_revendreth_monk',
    bonusID: 7726,
  },

  // end region
} as const;
export default legendaries;
