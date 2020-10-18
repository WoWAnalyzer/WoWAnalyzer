import { SpellList, LegendarySpell } from "common/SPELLS/Spell";

const legendaries: SpellList<LegendarySpell> = {
  //region Brewmaster

  //endregion

  //region Mistweaver
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
  ANCIENT_TEACHINGS_OF_THE_MONASTERY_HEAL:{
    id: 126890,
    name: 'Ancient Teachings of the Monastery',
    icon: 'inv_jewelcrafting_jadeserpent',
  },
  CLOUDED_FOCUS_BUFF:{
    id: 337476,
    name: 'Clouded Focus',
    icon: 'ability_monk_surgingmist',
  },


  //endregion

  //region Windwalker
  XUENS_BATTLEGEAR: {
    id: 337481,
    name: 'Xuen\'s Battlegear',
    icon: 'monk_stance_whitetiger',
    bonusID: 7070,
  },
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
  FATAL_TOUCH: {
    id: 337296,
    name: 'Fatal Touch',
    icon: 'ability_monk_touchofdeath',
    bonusID: 7081,
  },

  //endregion
};
export default legendaries;
