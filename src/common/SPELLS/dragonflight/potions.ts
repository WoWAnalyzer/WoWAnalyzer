import Spell from '../Spell';

const spells = {
  //region Air Potions
  AERATED_MANA_POTION: {
    id: 370607,
    name: 'Aerated Mana Potion',
    icon: 'inv_potion_49',
  },
  POTION_OF_THE_HUSHED_ZEPHYR: {
    id: 371125,
    name: 'Potion of the Hushed Zephyr',
    icon: 'ui_profession_alchemy',
  },
  POTION_OF_SHOCKING_DISCLOSURE: {
    id: 370816,
    name: 'Potion of Shocking Disclosure',
    icon: 'inv_10_alchemy_bottle_shape1_violet',
  },
  POTION_OF_GUSTS: {
    id: 371164,
    name: 'Potion of Gusts',
    icon: 'inv_10_alchemy_bottle_shape1_green',
  },
  BOTTLED_PUTRESCENCE: {
    id: 372046,
    name: 'Bottled Putrescence',
    icon: 'inv_misc_potiona3',
  },
  RESIDUAL_NEURAL_CHANNELING_AGENT: {
    id: 371622,
    name: 'Residual Neural Channeling Agent',
    icon: 'achievement_boss_anomalus',
  },
  //endregion

  //region Frost Potions
  REFRESHING_HEALING_POTION: {
    id: 370511,
    name: 'Refreshing Healing Potion',
    icon: 'inv_potion_49',
  },
  POTION_OF_FROZEN_FATALITY: {
    id: 371646,
    name: 'Potion of Frozen Fatality',
    icon: 'ui_profession_alchemy',
  },
  POTION_OF_FROZEN_FOCUS: {
    id: 371033,
    name: 'Potion of Frozen Focus',
    icon: 'inv_10_alchemy_bottle_shape4_blue',
  },
  POTION_OF_WITHERING_VITALITY: {
    id: 371039,
    name: 'Potion of Withering Vitality',
    icon: 'inv_misc_herb_constrictorgrass',
  },
  DELICATE_SUSPENSION_OF_SPORES: {
    id: 371055,
    name: 'Delicate Suspension of Spores',
    icon: 'inv_misc_food_96_zangarcaps',
  },
  // each rank has different duration and thus different spell id
  POTION_OF_CHILLED_CLARITY_R1: {
    id: 371149,
    name: 'Potion of Chilled Clarity',
    icon: 'ui_profession_alchemy',
  },
  POTION_OF_CHILLED_CLARITY_R2: {
    id: 371151,
    name: 'Potion of Chilled Clarity',
    icon: 'ui_profession_alchemy',
  },
  POTION_OF_CHILLED_CLARITY_R3: {
    id: 371152,
    name: 'Potion of Chilled Clarity',
    icon: 'ui_profession_alchemy',
  },
  //endregion

  //region Elemental Potions
  ELEMENTAL_POTION_OF_POWER: {
    id: 371024,
    name: 'Elemental Potion of Power',
    icon: 'trade_alchemy_dpotion_b10',
  },
  ELEMENTAL_POTION_OF_ULTIMATE_POWER: {
    id: 371028,
    name: 'Elemental Potion of Ultimate Power',
    icon: 'trade_alchemy_dpotion_b20',
  },
  //endregion
} satisfies Record<string, Spell>;

export default spells;
