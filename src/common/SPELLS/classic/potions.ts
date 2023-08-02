import Spell from '../Spell';

const spells = {
  // id = buff or spell id
  CRAZY_ALCHEMISTS_POTION: {
    id: 53750,
    name: "Crazy Alchemist's Potion",
    icon: 'inv_potion_27',
  },
  INDESTRUCTIBLE_POTION: {
    id: 53762,
    name: 'Indestructible Potion',
    icon: 'inv_alchemy_elixir_empty',
  },
  MIGHTY_ARCANE_PROTECTION_POTION: {
    id: 53910,
    name: 'Mighty Arcane Protection Potion',
    icon: 'inv_potion_159',
  },
  MIGHTY_FIRE_PROTECTION_POTION: {
    id: 53911,
    name: 'Mighty Fire Protection Potion',
    icon: 'inv_potion_146',
  },
  MIGHTY_FROST_PROTECTION_POTION: {
    id: 53913,
    name: 'Mighty Frost Protection Potion',
    icon: 'inv_potion_156',
  },
  MIGHTY_NATURE_PROTECTION_POTION: {
    id: 53914,
    name: 'Mighty Nature Protection Potion',
    icon: 'inv_potion_155',
  },
  MIGHTY_SHADOW_PROTECTION_POTION: {
    id: 53915,
    name: 'Mighty Shadow Protection Potion',
    icon: 'inv_potion_158',
  },
  POTION_OF_NIGHTMARES: {
    id: 53753,
    name: 'Potion of Nightmares',
    icon: 'inv_alchemy_elixir_03',
  },
  POTION_OF_SPEED: {
    id: 53908,
    name: 'Potion of Speed',
    icon: 'inv_alchemy_elixir_04',
  },
  POTION_OF_WILD_MAGIC: {
    id: 53909,
    name: 'Potion of Wild Magic',
    icon: 'inv_alchemy_elixir_01',
  },
  POWERFUL_REJUVENATION_POTION: {
    id: 53761,
    name: 'Powerful Rejuvenation Potion',
    icon: 'inv_alchemy_elixir_06',
  },
  RUNIC_HEALING_INJECTOR: {
    id: 67489,
    name: 'Runic Healing Injector',
    icon: 'inv_gizmo_runichealthinjector',
  },
  RUNIC_HEALING_POTION: {
    id: 43185,
    name: 'Runic Healing Potion',
    icon: 'inv_alchemy_elixir_05',
  },
  RUNIC_MANA_INJECTOR: {
    id: 67490,
    name: 'Runic Mana Injector',
    icon: 'inv_gizmo_runicmanainjector',
  },
  RUNIC_MANA_POTION: {
    id: 43186,
    name: 'Runic Mana Potion',
    icon: 'inv_alchemy_elixir_02',
  },
} satisfies Record<string, Spell>;

export default spells;
