import Item from 'common/ITEMS/Item';

const potions = {
  //region Air Potions
  AERATED_MANA_POTION_R1: {
    id: 191384,
    name: 'Aerated Mana Potion',
    icon: 'inv_10_alchemy_bottle_shape1_blue',
  },
  AERATED_MANA_POTION_R2: {
    id: 191385,
    name: 'Aerated Mana Potion',
    icon: 'inv_10_alchemy_bottle_shape1_blue',
  },
  AERATED_MANA_POTION_R3: {
    id: 191386,
    name: 'Aerated Mana Potion',
    icon: 'inv_10_alchemy_bottle_shape1_blue',
  },
  POTION_OF_THE_HUSHED_ZEPHYR_R1: {
    id: 191393,
    name: 'Potion of the Hushed Zephyr',
    icon: 'inv_10_alchemy_bottle_shape1_white',
  },
  POTION_OF_THE_HUSHED_ZEPHYR_R2: {
    id: 191394,
    name: 'Potion of the Hushed Zephyr',
    icon: 'inv_10_alchemy_bottle_shape1_white',
  },
  POTION_OF_THE_HUSHED_ZEPHYR_R3: {
    id: 191395,
    name: 'Potion of the Hushed Zephyr',
    icon: 'inv_10_alchemy_bottle_shape1_white',
  },
  POTION_OF_SHOCKING_DISCLOSURE_R1: {
    id: 191399,
    name: 'Potion of shocking Disclosure',
    icon: 'inv_10_alchemy_bottle_shape1_violet',
  },
  POTION_OF_SHOCKING_DISCLOSURE_R2: {
    id: 191400,
    name: 'Potion of shocking Disclosure',
    icon: 'inv_10_alchemy_bottle_shape1_violet',
  },
  POTION_OF_SHOCKING_DISCLOSURE_R3: {
    id: 191401,
    name: 'Potion of shocking Disclosure',
    icon: 'inv_10_alchemy_bottle_shape1_violet',
  },
  POTION_OF_GUSTS_R1: {
    id: 191396,
    name: 'Potion of Gusts',
    icon: 'inv_10_alchemy_bottle_shape1_green',
  },
  POTION_OF_GUSTS_R2: {
    id: 191397,
    name: 'Potion of Gusts',
    icon: 'inv_10_alchemy_bottle_shape1_green',
  },
  POTION_OF_GUSTS_R3: {
    id: 191398,
    name: 'Potion of Gusts',
    icon: 'inv_10_alchemy_bottle_shape1_green',
  },
  BOTTLED_PUTRESCENCE_R1: {
    id: 191360,
    name: 'Bottled Putrescence',
    icon: 'inv_10_alchemy_bottle_shape1_black',
  },
  BOTTLED_PUTRESCENCE_R2: {
    id: 191361,
    name: 'Bottled Putrescence',
    icon: 'inv_10_alchemy_bottle_shape1_black',
  },
  BOTTLED_PUTRESCENCE_R3: {
    id: 191362,
    name: 'Bottled Putrescence',
    icon: 'inv_10_alchemy_bottle_shape1_black',
  },
  RESIDUAL_NEURAL_CHANNELING_AGENT_R1: {
    id: 191372,
    name: 'Residual Neural Channeling Agent',
    icon: 'inv_10_alchemy_bottle_shape1_yellow',
  },
  RESIDUAL_NEURAL_CHANNELING_AGENT_R2: {
    id: 191373,
    name: 'Residual Neural Channeling Agent',
    icon: 'inv_10_alchemy_bottle_shape1_yellow',
  },
  RESIDUAL_NEURAL_CHANNELING_AGENT_R3: {
    id: 191374,
    name: 'Residual Neural Channeling Agent',
    icon: 'inv_10_alchemy_bottle_shape1_yellow',
  },
  //endregion

  //region Frost Potions
  DREAMWALKERS_HEALING_POTION_R1: {
    id: 207021,
    name: "Dreamwalker's Healing Potion",
    icon: 'Inv_10_alchemy_bottle_shape4_pink',
  },
  DREAMWALKERS_HEALING_POTION_R2: {
    id: 207022,
    name: "Dreamwalker's Healing Potion",
    icon: 'Inv_10_alchemy_bottle_shape4_pink',
  },
  DREAMWALKERS_HEALING_POTION_R3: {
    id: 207023,
    name: "Dreamwalker's Healing Potion",
    icon: 'Inv_10_alchemy_bottle_shape4_pink',
  },
  REFRESHING_HEALING_POTION_R1: {
    id: 191378,
    name: 'Refreshing Healing Potion',
    icon: 'inv_10_alchemy_bottle_shape4_red',
  },
  REFRESHING_HEALING_POTION_R2: {
    id: 191379,
    name: 'Refreshing Healing Potion',
    icon: 'inv_10_alchemy_bottle_shape4_red',
  },
  REFRESHING_HEALING_POTION_R3: {
    id: 191380,
    name: 'Refreshing Healing Potion',
    icon: 'inv_10_alchemy_bottle_shape4_red',
  },
  POTION_OF_FROZEN_FATALITY_R1: {
    id: 191351,
    name: 'Potion of Frozen Fatality',
    icon: 'inv_10_alchemy_bottle_shape4_black',
  },
  POTION_OF_FROZEN_FATALITY_R2: {
    id: 191352,
    name: 'Potion of Frozen Fatality',
    icon: 'inv_10_alchemy_bottle_shape4_black',
  },
  POTION_OF_FROZEN_FATALITY_R3: {
    id: 191353,
    name: 'Potion of Frozen Fatality',
    icon: 'inv_10_alchemy_bottle_shape4_black',
  },
  POTION_OF_FROZEN_FOCUS_R1: {
    id: 191363,
    name: 'Potion of Frozen Focus',
    icon: 'inv_10_alchemy_bottle_shape4_blue',
  },
  POTION_OF_FROZEN_FOCUS_R2: {
    id: 191364,
    name: 'Potion of Frozen Focus',
    icon: 'inv_10_alchemy_bottle_shape4_blue',
  },
  POTION_OF_FROZEN_FOCUS_R3: {
    id: 191365,
    name: 'Potion of Frozen Focus',
    icon: 'inv_10_alchemy_bottle_shape4_blue',
  },
  POTION_OF_WITHERING_VITALITY_R1: {
    id: 191369,
    name: 'Potion of Withering Vitality',
    icon: 'inv_10_alchemy_bottle_shape4_orange',
  },
  POTION_OF_WITHERING_VITALITY_R2: {
    id: 191370,
    name: 'Potion of Withering Vitality',
    icon: 'inv_10_alchemy_bottle_shape4_orange',
  },
  POTION_OF_WITHERING_VITALITY_R3: {
    id: 191371,
    name: 'Potion of Withering Vitality',
    icon: 'inv_10_alchemy_bottle_shape4_orange',
  },
  DELICATE_SUSPENSION_OF_SPORES_R1: {
    id: 191375,
    name: 'Delicate Suspension of Spores',
    icon: 'inv_10_alchemy_bottle_shape4_yellow',
  },
  DELICATE_SUSPENSION_OF_SPORES_R2: {
    id: 191376,
    name: 'Delicate Suspension of Spores',
    icon: 'inv_10_alchemy_bottle_shape4_yellow',
  },
  DELICATE_SUSPENSION_OF_SPORES_R3: {
    id: 191377,
    name: 'Delicate Suspension of Spores',
    icon: 'inv_10_alchemy_bottle_shape4_yellow',
  },
  POTION_OF_CHILLED_CLARITY_R1: {
    id: 191366,
    name: 'Potion of Chilled Clarity',
    icon: 'inv_10_alchemy_bottle_shape4_green',
  },
  POTION_OF_CHILLED_CLARITY_R2: {
    id: 191367,
    name: 'Potion of Chilled Clarity',
    icon: 'inv_10_alchemy_bottle_shape4_green',
  },
  POTION_OF_CHILLED_CLARITY_R3: {
    id: 191368,
    name: 'Potion of Chilled Clarity',
    icon: 'inv_10_alchemy_bottle_shape4_green',
  },
  //endregion

  //region Cauldron Potions
  FLEETING_ELEMENTAL_POTION_OF_POWER_R1: {
    id: 191905,
    name: 'Fleeting Elemental Potion of Power',
    icon: 'trade_alchemy_dpotion_b10',
  },
  FLEETING_ELEMENTAL_POTION_OF_POWER_R2: {
    id: 191906,
    name: 'Fleeting Elemental Potion of Power',
    icon: 'trade_alchemy_dpotion_b10',
  },
  FLEETING_ELEMENTAL_POTION_OF_POWER_R3: {
    id: 191907,
    name: 'Fleeting Elemental Potion of Power',
    icon: 'trade_alchemy_dpotion_b10',
  },
  FLEETING_ELEMENTAL_POTION_OF_ULTIMATE_POWER_R1: {
    id: 191912,
    name: 'Fleeting Elemental Potion of Ultimate Power',
    icon: 'trade_alchemy_dpotion_b20',
  },
  FLEETING_ELEMENTAL_POTION_OF_ULTIMATE_POWER_R2: {
    id: 191913,
    name: 'Fleeting Elemental Potion of Ultimate Power',
    icon: 'trade_alchemy_dpotion_b20',
  },
  FLEETING_ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3: {
    id: 191914,
    name: 'Fleeting Elemental Potion of Ultimate Power',
    icon: 'trade_alchemy_dpotion_b20',
  },
  //endregion

  //region Elemental Potions
  ELEMENTAL_POTION_OF_POWER_R1: {
    id: 191387,
    name: 'Elemental Potion of Power',
    icon: 'trade_alchemy_dpotion_b10',
  },
  ELEMENTAL_POTION_OF_POWER_R2: {
    id: 191388,
    name: 'Elemental Potion of Power',
    icon: 'trade_alchemy_dpotion_b10',
  },
  ELEMENTAL_POTION_OF_POWER_R3: {
    id: 191389,
    name: 'Elemental Potion of Power',
    icon: 'trade_alchemy_dpotion_b10',
  },
  ELEMENTAL_POTION_OF_ULTIMATE_POWER_R1: {
    id: 191381,
    name: 'Elemental Potion of Ultimate Power',
    icon: 'trade_alchemy_dpotion_b20',
  },
  ELEMENTAL_POTION_OF_ULTIMATE_POWER_R2: {
    id: 191382,
    name: 'Elemental Potion of Ultimate Power',
    icon: 'trade_alchemy_dpotion_b20',
  },
  ELEMENTAL_POTION_OF_ULTIMATE_POWER_R3: {
    id: 191383,
    name: 'Elemental Potion of Ultimate Power',
    icon: 'trade_alchemy_dpotion_b20',
  },
  //endregion
} satisfies Record<string, Item>;

export default potions;
