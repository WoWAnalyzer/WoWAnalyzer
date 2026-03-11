import Spell from '../Spell';

const Potions = {
  SILVERMOON_HEALTH_POTION: {
    name: 'Silvermoon Health Potion',
    id: 1234768,
    icon: 'inv_potion_49',
  },
  LIGHTS_PRESERVATION: {
    id: 1235568,
    name: "Light's Preservation",
    icon: 'inv_alchemy_80_potion02yellow',
  },
  REFRESHING_SERUM: {
    id: 1236590,
    name: 'Refreshing Serum',
    icon: 'inv_alchemy_80_potion01purple',
  },
  LIGHTS_POTENTIAL: {
    id: 1236616,
    name: "Light's Potential",
    icon: 'inv_12_profession_alchemy_lightpotion_yellow',
  },
  LIGHTFUSED_MANA_POTION: {
    name: 'Lightfused Mana Potion',
    id: 1236648,
    icon: 'inv_12_profession_alchemy_lightpotion_blue',
  },
  POTION_OF_RECKLESSNESS: {
    name: 'Potion of Recklessness',
    id: 1236994,
    icon: 'inv_12_profession_alchemy_voidpotion_red',
  },
  DRAUGHT_OF_RAMPANT_ABANDON: {
    id: 1236998,
    name: 'Draught of Rampant Abandon',
    icon: 'inv_12_profession_alchemy_voidpotion_purple',
  },
  POTION_OF_ZEALOTRY: {
    id: 1238443,
    name: 'Potion of Zealotry',
    icon: 'inv_12_profession_alchemy_lightpotion_green',
  },
  POTION_OF_DEVOURED_DREAMS: {
    id: 1239479,
    name: 'Potion of Devoured Dreams',
    icon: 'inv_12_profession_alchemy_voidpotion_blue',
  },
  AMANI_EXTRACT: {
    id: 1263074,
    name: 'Amani Extract',
    icon: 'inv_alchemy_elixir_04',
  },
} satisfies Record<string, Spell>;

export default Potions;
