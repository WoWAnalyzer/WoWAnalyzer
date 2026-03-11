import { CraftedItem } from '../Item';

const potions = {
  LIGHTS_PRESERVATION_R1: {
    id: 241287,
    name: "Light's Preservation",
    icon: 'inv_alchemy_80_potion02yellow',
    craftQuality: 1,
  },
  LIGHTS_PRESERVATION_R2: {
    id: 241286,
    name: "Light's Preservation",
    icon: 'inv_alchemy_80_potion02yellow',
    craftQuality: 2,
  },
  POTION_OF_RECKLESSNESS_R1: {
    id: 241289,
    name: 'Potion of Recklessness',
    icon: 'inv_12_profession_alchemy_voidpotion_red',
    craftQuality: 1,
  },
  POTION_OF_RECKLESSNESS_R2: {
    id: 241288,
    name: 'Potion of Recklessness',
    icon: 'inv_12_profession_alchemy_voidpotion_red',
    craftQuality: 2,
  },
  DRAUGHT_OF_RAMPANT_ABANDON_R1: {
    id: 241293,
    name: 'Draught of Rampant Abandon',
    icon: 'inv_12_profession_alchemy_voidpotion_purple',
    craftQuality: 1,
  },
  DRAUGHT_OF_RAMPANT_ABANDON_R2: {
    id: 241292,
    name: 'Draught of Rampant Abandon',
    icon: 'inv_12_profession_alchemy_voidpotion_purple',
    craftQuality: 2,
  },
  POTION_OF_DEVOURED_DREAMS_R1: {
    id: 241295,
    name: 'Potion of Devoured Dreams',
    icon: 'inv_12_profession_alchemy_voidpotion_blue',
    craftQuality: 1,
  },
  POTION_OF_DEVOURED_DREAMS_R2: {
    id: 241294,
    name: 'Potion of Devoured Dreams',
    icon: 'inv_12_profession_alchemy_voidpotion_blue',
    craftQuality: 2,
  },
  POTION_OF_ZEALOTRY_R1: {
    id: 241297,
    name: 'Potion of Zealotry',
    icon: 'inv_12_profession_alchemy_lightpotion_green',
    craftQuality: 1,
  },
  POTION_OF_ZEALOTRY_R2: {
    id: 241296,
    name: 'Potion of Zealotry',
    icon: 'inv_12_profession_alchemy_lightpotion_green',
    craftQuality: 2,
  },
  AMANI_EXTRACT_R1: {
    id: 241299,
    name: 'Amani Extract',
    icon: 'inv_alchemy_elixir_04',
    craftQuality: 1,
  },
  AMANI_EXTRACT_R2: {
    id: 241298,
    name: 'Amani Extract',
    icon: 'inv_alchemy_elixir_04',
    craftQuality: 2,
  },
  LIGHTFUSED_MANA_POTION_R1: {
    id: 241301,
    name: 'Lightfused Mana Potion',
    icon: 'inv_12_profession_alchemy_lightpotion_blue',
    craftQuality: 1,
  },
  LIGHTFUSED_MANA_POTION_R2: {
    id: 241300,
    name: 'Lightfused Mana Potion',
    icon: 'inv_12_profession_alchemy_lightpotion_blue',
    craftQuality: 2,
  },
  SILVERMOON_HEALTH_POTION_R1: {
    id: 241305,
    name: 'Silvermoon Health Potion',
    icon: 'inv_12_profession_alchemy_lightpotion_orange',
    craftQuality: 1,
  },
  SILVERMOON_HEALTH_POTION_R2: {
    id: 241304,
    name: 'Silvermoon Health Potion',
    icon: 'inv_12_profession_alchemy_lightpotion_orange',
    craftQuality: 2,
  },
  REFRESHING_SERUM_R1: {
    id: 241307,
    name: 'Refreshing Serum',
    icon: 'inv_alchemy_80_potion01purple',
    craftQuality: 1,
  },
  REFRESHING_SERUM_R2: {
    id: 241306,
    name: 'Refreshing Serum',
    icon: 'inv_alchemy_80_potion01purple',
    craftQuality: 2,
  },
  LIGHTS_POTENTIAL_R1: {
    id: 241309,
    name: "Light's Potential",
    icon: 'inv_12_profession_alchemy_lightpotion_yellow',
    craftQuality: 1,
  },
  LIGHTS_POTENTIAL_R2: {
    id: 241308,
    name: "Light's Potential",
    icon: 'inv_12_profession_alchemy_lightpotion_yellow',
    craftQuality: 2,
  },
} satisfies Record<string, CraftedItem>;

export default potions;
