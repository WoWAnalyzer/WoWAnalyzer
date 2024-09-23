import { CraftedItem } from 'common/ITEMS/Item';

const phials = {
  // Air Phials
  AERATED_PHIAL_OF_QUICK_HANDS_R1: {
    id: 197720,
    name: 'Aerated Phial of Quick Hands',
    icon: 'inv_10_alchemy_bottle_shape3_red',
    craftQuality: 1,
  },
  AERATED_PHIAL_OF_QUICK_HANDS_R2: {
    id: 197721,
    name: 'Aerated Phial of Quick Hands',
    icon: 'inv_10_alchemy_bottle_shape3_red',
    craftQuality: 2,
  },
  AERATED_PHIAL_OF_QUICK_HANDS_R3: {
    id: 197722,
    name: 'Aerated Phial of Quick Hands',
    icon: 'inv_10_alchemy_bottle_shape3_red',
    craftQuality: 3,
  },
  AERATED_PHIAL_OF_DEFTNESS_R1: {
    id: 191342,
    name: 'Aerated Phial of Deftness',
    icon: 'inv_10_alchemy_bottle_shape3_orange',
    craftQuality: 1,
  },
  AERATED_PHIAL_OF_DEFTNESS_R2: {
    id: 191343,
    name: 'Aerated Phial of Deftness',
    icon: 'inv_10_alchemy_bottle_shape3_orange',
    craftQuality: 2,
  },
  AERATED_PHIAL_OF_DEFTNESS_R3: {
    id: 191344,
    name: 'Aerated Phial of Deftness',
    icon: 'inv_10_alchemy_bottle_shape3_orange',
    craftQuality: 3,
  },
  CHARGED_PHIAL_OF_ALACRITY_R1: {
    id: 191348,
    name: 'Charged Phial of Alacrity',
    icon: 'inv_10_alchemy_bottle_shape3_yellow',
    craftQuality: 1,
  },
  CHARGED_PHIAL_OF_ALACRITY_R2: {
    id: 191349,
    name: 'Charged Phial of Alacrity',
    icon: 'inv_10_alchemy_bottle_shape3_yellow',
    craftQuality: 2,
  },
  CHARGED_PHIAL_OF_ALACRITY_R3: {
    id: 191350,
    name: 'Charged Phial of Alacrity',
    icon: 'inv_10_alchemy_bottle_shape3_yellow',
    craftQuality: 3,
  },
  PHIAL_OF_CHARGED_ISOLATION_R1: {
    id: 191330,
    name: 'Phial of Charged Isolation',
    icon: 'inv_10_alchemy_bottle_shape3_white',
    craftQuality: 1,
  },
  PHIAL_OF_CHARGED_ISOLATION_R2: {
    id: 191331,
    name: 'Phial of Charged Isolation',
    icon: 'inv_10_alchemy_bottle_shape3_white',
    craftQuality: 2,
  },
  PHIAL_OF_CHARGED_ISOLATION_R3: {
    id: 191332,
    name: 'Phial of Charged Isolation',
    icon: 'inv_10_alchemy_bottle_shape3_white',
    craftQuality: 3,
  },
  PHIAL_OF_STATIC_EMPOWERMENT_R1: {
    id: 191336,
    name: 'Phial of Static Empowerment',
    icon: 'inv_10_alchemy_bottle_shape3_violet',
    craftQuality: 1,
  },
  PHIAL_OF_STATIC_EMPOWERMENT_R2: {
    id: 191337,
    name: 'Phial of Static Empowerment',
    icon: 'inv_10_alchemy_bottle_shape3_violet',
    craftQuality: 2,
  },
  PHIAL_OF_STATIC_EMPOWERMENT_R3: {
    id: 191338,
    name: 'Phial of Static Empowerment',
    icon: 'inv_10_alchemy_bottle_shape3_violet',
    craftQuality: 3,
  },
  PHIAL_OF_STILL_AIR_R1: {
    id: 191321,
    name: 'Phial of Still Air',
    icon: 'inv_10_alchemy_bottle_shape3_green',
    craftQuality: 1,
  },
  PHIAL_OF_STILL_AIR_R2: {
    id: 191322,
    name: 'Phial of Still Air',
    icon: 'inv_10_alchemy_bottle_shape3_green',
    craftQuality: 2,
  },
  PHIAL_OF_STILL_AIR_R3: {
    id: 191323,
    name: 'Phial of Still Air',
    icon: 'inv_10_alchemy_bottle_shape3_green',
    craftQuality: 3,
  },
  PHIAL_OF_THE_EYE_IN_THE_STORM_R1: {
    id: 191318,
    name: 'Phial of the Eye in the Storm',
    icon: 'inv_10_alchemy_bottle_shape3_blue',
    craftQuality: 1,
  },
  PHIAL_OF_THE_EYE_IN_THE_STORM_R2: {
    id: 191319,
    name: 'Phial of the Eye in the Storm',
    icon: 'inv_10_alchemy_bottle_shape3_blue',
    craftQuality: 2,
  },
  PHIAL_OF_THE_EYE_IN_THE_STORM_R3: {
    id: 191320,
    name: 'Phial of the Eye in the Storm',
    icon: 'inv_10_alchemy_bottle_shape3_blue',
    craftQuality: 3,
  },

  // Frost Phials
  PHIAL_OF_TEPID_VERSATILITY_R1: {
    id: 191339,
    name: 'Phial of Tepid Versatility',
    icon: 'inv_10_alchemy_bottle_shape2_black',
    craftQuality: 1,
  },
  PHIAL_OF_TEPID_VERSATILITY_R2: {
    id: 191340,
    name: 'Phial of Tepid Versatility',
    icon: 'inv_10_alchemy_bottle_shape2_black',
    craftQuality: 2,
  },
  PHIAL_OF_TEPID_VERSATILITY_R3: {
    id: 191341,
    name: 'Phial of Tepid Versatility',
    icon: 'inv_10_alchemy_bottle_shape2_black',
    craftQuality: 3,
  },
  CRYSTALLINE_PHIAL_OF_PERCEPTION_R1: {
    id: 191354,
    name: 'Crystalline Phial of Perception',
    icon: 'inv_10_alchemy_bottle_shape2_yellow',
    craftQuality: 1,
  },
  CRYSTALLINE_PHIAL_OF_PERCEPTION_R2: {
    id: 191355,
    name: 'Crystalline Phial of Perception',
    icon: 'inv_10_alchemy_bottle_shape2_yellow',
    craftQuality: 2,
  },
  CRYSTALLINE_PHIAL_OF_PERCEPTION_R3: {
    id: 191356,
    name: 'Crystalline Phial of Perception',
    icon: 'inv_10_alchemy_bottle_shape2_yellow',
    craftQuality: 3,
  },
  STEAMING_PHIAL_OF_FINESSE_R1: {
    id: 191345,
    name: 'Steaming Phial of Finesse',
    icon: 'inv_10_alchemy_bottle_shape2_violet',
    craftQuality: 1,
  },
  STEAMING_PHIAL_OF_FINESSE_R2: {
    id: 191346,
    name: 'Steaming Phial of Finesse',
    icon: 'inv_10_alchemy_bottle_shape2_violet',
    craftQuality: 2,
  },
  STEAMING_PHIAL_OF_FINESSE_R3: {
    id: 191347,
    name: 'Steaming Phial of Finesse',
    icon: 'inv_10_alchemy_bottle_shape2_violet',
    craftQuality: 3,
  },
  PHIAL_OF_GLACIAL_FURY_R1: {
    id: 191333,
    name: 'Phial of Glacial Fury',
    icon: 'inv_10_alchemy_bottle_shape2_white',
    craftQuality: 1,
  },
  PHIAL_OF_GLACIAL_FURY_R2: {
    id: 191334,
    name: 'Phial of Glacial Fury',
    icon: 'inv_10_alchemy_bottle_shape2_white',
    craftQuality: 2,
  },
  PHIAL_OF_GLACIAL_FURY_R3: {
    id: 191335,
    name: 'Phial of Glacial Fury',
    icon: 'inv_10_alchemy_bottle_shape2_white',
    craftQuality: 3,
  },
  ICED_PHIAL_OF_CORRUPTING_RAGE_R1: {
    id: 191327,
    name: 'Iced Phial of Corrupting Rage',
    icon: 'inv_10_alchemy_bottle_shape2_red',
    craftQuality: 1,
  },
  ICED_PHIAL_OF_CORRUPTING_RAGE_R2: {
    id: 191328,
    name: 'Iced Phial of Corrupting Rage',
    icon: 'inv_10_alchemy_bottle_shape2_red',
    craftQuality: 2,
  },
  ICED_PHIAL_OF_CORRUPTING_RAGE_R3: {
    id: 191329,
    name: 'Iced Phial of Corrupting Rage',
    icon: 'inv_10_alchemy_bottle_shape2_red',
    craftQuality: 3,
  },
  PHIAL_OF_ICY_PRESERVATION_R1: {
    id: 191324,
    name: 'Phial of Icy Preservation',
    icon: 'inv_10_alchemy_bottle_shape2_blue',
    craftQuality: 1,
  },
  PHIAL_OF_ICY_PRESERVATION_R2: {
    id: 191325,
    name: 'Phial of Icy Preservation',
    icon: 'inv_10_alchemy_bottle_shape2_blue',
    craftQuality: 2,
  },
  PHIAL_OF_ICY_PRESERVATION_R3: {
    id: 191326,
    name: 'Phial of Icy Preservation',
    icon: 'inv_10_alchemy_bottle_shape2_blue',
    craftQuality: 3,
  },

  // Elemental Phials
  PHIAL_OF_ELEMENTAL_CHAOS_R1: {
    id: 191357,
    name: 'Phial of Elemental Chaos',
    icon: 'inv_10_alchemy_bottle_shape2_orange',
    craftQuality: 1,
  },
  PHIAL_OF_ELEMENTAL_CHAOS_R2: {
    id: 191358,
    name: 'Phial of Elemental Chaos',
    icon: 'inv_10_alchemy_bottle_shape2_orange',
    craftQuality: 2,
  },
  PHIAL_OF_ELEMENTAL_CHAOS_R3: {
    id: 191359,
    name: 'Phial of Elemental Chaos',
    icon: 'inv_10_alchemy_bottle_shape2_orange',
    craftQuality: 3,
  },
} satisfies Record<string, CraftedItem>;

export default phials;
