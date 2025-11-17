import Spell from '../Spell';

const Potions = {
  ALGARI_HEALING_POTION: {
    name: 'Algari Healing Potion',
    id: 431416,
    icon: 'inv_potion_49',
  },
  ALGARI_MANA_POTION: {
    name: 'Algari Mana Potion',
    id: 431418,
    icon: 'inv_potion_49',
  },
  CAVEDWELLERS_DELIGHT: {
    name: "Cavedweller's Delight",
    id: 431419,
    icon: 'inv_potion_49',
  },
  DRAUGHT_OF_SHOCKING_REVELATIONS: {
    name: 'Draught of Shocking Revelations',
    id: 431432,
    icon: 'inv_potion_62',
  },
  FRONTLINE_POTION: {
    name: 'Frontline Potion',
    id: 431925,
    icon: 'inv_alchemy_potion_empty',
  },
  GROTESQUE_VIAL: {
    name: 'Grotesque Vial',
    id: 460074,
    icon: 'inv_misc_slime_01',
  },
  POTION_OF_THE_REBORN_CHEETAH: {
    name: 'Potion of the Reborn Cheetah',
    id: 431941,
    icon: 'inv_misc_potionseta',
  },
  POTION_OF_UNWAVERING_FOCUS: {
    name: 'Potion of Unwavering Focus',
    id: 431914,
    icon: 'inv_potion_16',
  },
  SLUMBERING_SOUL_SERUM: {
    name: 'Slumbering Soul Serum',
    id: 431422,
    icon: 'inv_10_alchemy_bottle_shape4_blue',
  },
  TEMPERED_POTION: {
    name: 'Tempered Potion',
    id: 431932,
    icon: 'trade_alchemy_potiona4',
  },
  // Draught of Silent Footfalls
  TREADING_LIGHTLY: {
    name: 'Treading Lightly',
    id: 431424,
    icon: 'ability_priest_shadowyapparition',
  },
} satisfies Record<string, Spell>;

export default Potions;
