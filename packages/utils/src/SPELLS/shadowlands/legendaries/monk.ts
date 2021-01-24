const legendaries = {
  //region Brewmaster
  CHARRED_PASSIONS: {
    id: 338138,
    name: 'Charred Passions',
    icon: 'ability_monk_mightyoxkick',
    bonusID: 7076,
  },
  STORMSTOUTS_LAST_KEG: {
    id: 337288,
    name: 'Stormstout\'s Last Keg',
    icon: 'achievement_brewery_2',
    bonusID: 7077,
  },
  CELESTIAL_INFUSION: {
    id: 337290,
    name: 'Celestial Infusion',
    icon: 'achievement_faction_brewmaster',
    bonusID: 7078
  },
  SHAOHAOS_MIGHT: {
    id: 337570,
    name: 'Shaohao\'s Might',
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
  TEAR_OF_MORNING_BUFF: {
    id: 337993,
    name: 'Tear of Morning',
    icon: 'ability_monk_pathofmists',
  },
  TEAR_OF_MORNING_HEAL: {
    id: 337992,
    name: 'Tear of Morning',
    icon: 'ability_monk_pathofmists',
  },
  YULONS_WHISPER: {
    id: 337225,
    name: 'Yu\'lon\'s Whisper',
    icon: 'ability_monk_dragonkick',
    bonusID: 7073,
  },
  CLOUDED_FOCUS: {
    id: 337343,
    name: 'Clouded Focus',
    icon: 'ability_monk_soothingmist',
    bonusID: 7074,
  },
  CLOUDED_FOCUS_BUFF:{
    id: 337476,
    name: 'Clouded Focus',
    icon: 'ability_monk_surgingmist',
  },
  ANCIENT_TEACHINGS_OF_THE_MONASTERY: {
    id: 337172,
    name: 'Ancient Teachings of the Monastery',
    icon: 'passive_monk_teachingsofmonastery',
    bonusID: 7075,
  },
  ANCIENT_TEACHINGS_OF_THE_MONASTERY_HEAL:{
    id: 126890,
    name: 'Ancient Teachings of the Monastery',
    icon: 'inv_jewelcrafting_jadeserpent',
  },
  ANCIENT_TEACHINGS_OF_THE_MONASTERY_CRIT_HEAL:{
    id: 347572,
    name: 'Ancient Teachings of the Monastery',
    icon: 'inv_jewelcrafting_jadeserpent',
  },
  ANCIENT_TEACHINGS_OF_THE_MONASTERY_BUFF:{
    id: 347553,
    name: 'Ancient Teachings of the Monastery',
    icon: 'inv_misc_book_07',
  },
  //endregion

  //region Windwalker
  KEEFERS_SKYREACH: {
    id: 337334,
    name: 'Keefer\'s Skyreach',
    icon: 'inv__fistofthewhitetiger',
    bonusID: 7068,
  },
  LAST_EMPERORS_CAPACITOR: {
    id: 337292,
    name: 'Last Emperor\'s Capacitor',
    icon: 'ability_warrior_unrelentingassault',
    bonusID: 7069,
  },
  LAST_EMPERORS_CAPACITOR_BUFF: {
    id: 337291,
    name: 'The Emperor\'s Capcitor',
    icon: 'ability_monk_cracklingjadelightning',
  },
  XUENS_BATTLEGEAR: {
    id: 337481,
    name: 'Xuen\'s Battlegear',
    icon: 'monk_stance_whitetiger',
    bonusID: 7070,
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
  INVOKERS_DELIGHT: {
    id: 337298,
    name: 'Invoker\'s Delight',
    icon: 'inv_inscription_80_warscroll_battleshout',
    bonusID: 7082,
  },
  INVOKERS_DELIGHT_BUFF: {
    id: 338321,
    name: 'Invoker\'s Delight',
    icon: 'inv_inscription_80_warscroll_battleshout',
  },
  ESCAPE_FROM_REALITY: {
    id: 343250,
    name: 'Escape from Reality',
    icon: 'monk_ability_transcendence',
    bonusID: 7184,
  },

  //endregion
} as const;
export default legendaries;
