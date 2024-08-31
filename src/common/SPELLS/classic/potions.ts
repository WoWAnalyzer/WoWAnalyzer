import Spell from '../Spell';

const spells = {
  // id = buff/spell id
  EARTHEN_POTION: {
    id: 79475,
    name: 'Earthen Potion',
    icon: 'inv_alchemy_elixir_empty',
  },
  GOLEMBLOOD_POTION: {
    id: 79634,
    name: 'Golemblood Potion',
    icon: 'inv_potiond_1',
  },
  MIGHTY_REJUVENATION_POTION: {
    id: 78992,
    name: 'Mighty Rejuvenation Potion',
    icon: 'inv_misc_potionsetd',
  },
  MOLOTOV_COCKTAIL: {
    id: 2379,
    name: 'Molotov Cocktail',
    icon: 'inv_potion_95',
  },
  MYSTERIOUS_POTION: {
    id: 78778,
    name: 'Mysterious Potion',
    icon: 'inv_potiond_6',
  },
  MYTHICAL_HEALING_POTION: {
    id: 78989,
    name: 'Mythical Healing Potion',
    icon: 'inv_misc_potionsetf',
  },
  MYTHICAL_MANA_POTION: {
    id: 78990,
    name: 'Mythical Mana Potion',
    icon: 'inv_misc_potionsetc',
  },
  POTION_OF_CONCENTRATION: {
    id: 78993,
    name: 'Potion of Concentration',
    icon: 'inv_potionc_3',
  },
  POTION_OF_OGRE_RAGE: {
    id: 75488,
    name: 'Potion of Ogre Rage',
    icon: 'inv_alchemy_elixir_01',
  },
  POTION_OF_PURE_GENIUS: {
    id: 75487,
    name: 'Potion of Pure Genius',
    icon: 'inv_alchemy_elixir_06',
  },
  POTION_OF_SPEED: {
    id: 53908,
    name: 'Potion of Speed',
    icon: 'inv_alchemy_elixir_04',
  },
  POTION_OF_THE_COBRA: {
    id: 75489,
    name: 'Potion of the Cobra',
    icon: 'inv_alchemy_elixir_03',
  },
  POTION_OF_THE_TOLVIR: {
    id: 79633,
    name: "Potion of the Tol'vir",
    icon: 'inv_potiond_4',
  },
  VOLCANIC_POTION: {
    id: 79476,
    name: 'Volcanic Potion',
    icon: 'inv_potiond_3',
  },
} satisfies Record<string, Spell>;

export default spells;
