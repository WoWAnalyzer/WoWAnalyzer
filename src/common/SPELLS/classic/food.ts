import Spell from '../Spell';

// These are all the Well Fed buffs associated with each of the foods listed below.
// There is double up, so there is a chance the other food was used and it just shares the same buff as these.
const spells = {
  FISH_FEAST: {
    id: 57399,
    name: 'Fish Feast',
    icon: 'inv_misc_fish_52',
  },
  GREAT_FEAST: {
    id: 57294,
    name: 'Great Feast',
    icon: 'ability_hunter_pet_boar',
  },
  DRAGONFIN_FILET: {
    id: 57371,
    name: 'Dragonfin Filet',
    icon: 'inv_misc_food_75',
  },
  BLACKENED_DRAGONFIN: {
    id: 57367,
    name: 'Blackened Dragonfin',
    icon: 'inv_misc_food_142_fish',
  },
  FIRECRACKER_SALMON: {
    id: 57327,
    name: 'Firecracker Salmon',
    icon: 'inv_misc_food_141_fish',
  },
  SHOVELTUSK_STEAK: {
    id: 57139,
    name: 'Shoveltusk Steak',
    icon: 'inv_misc_food_89',
  },
  SMOKED_SALMON: {
    id: 57097,
    name: 'Smoked Salmon',
    icon: 'inv_misc_food_130_fish',
  },
  SNAPPER_EXTREME: {
    id: 57360,
    name: 'Snapper Extreme',
    icon: 'inv_misc_food_129_fish',
  },
  RHINOLICIOUS_WORMSTEAK: {
    id: 57356,
    name: 'Rhinolicious Wormsteak',
    icon: 'inv_misc_food_47',
  },
  HEARTY_RHINO: {
    id: 57358,
    name: 'Hearty Rhino',
    icon: 'inv_misc_food_115_condorsoup',
  },
  SPICY_FRIED_HERRING: {
    id: 57334,
    name: 'Spicy Fried Herring',
    icon: 'inv_misc_food_78',
  },
  PICKLED_FANGTOOTH: {
    id: 57107,
    name: 'Pickled Fangtooth',
    icon: 'inv_misc_food_76',
  },
  RHINO_DOGS: {
    id: 57291,
    name: 'Rhino Dogs',
    icon: 'inv_misc_food_53',
  },
  IMPERIAL_MANTA_STEAK: {
    id: 57332,
    name: 'Imperial Manta Steak',
    icon: 'inv_misc_food_121_buttermeat',
  },
  BAKED_MANTA_RAY: {
    id: 57102,
    name: 'Baked Manta Ray',
    icon: 'inv_misc_food_140_fish',
  },
  ROASTED_WORG: {
    id: 57288,
    name: 'Roasted Worg',
    icon: 'inv_misc_food_86_basilisk',
  },
  POACHED_NORTHERN_SCULPIN: {
    id: 57325,
    name: 'Poached Northern Sculpin',
    icon: 'inv_misc_food_77',
  },
  GRILLED_SCULPIN: {
    id: 57111,
    name: 'Grilled Sculpin',
    icon: 'inv_misc_food_79',
  },
  SPICY_BLUE_NETTLEFISH: {
    id: 57329,
    name: 'Spicy Blue Nettlefish',
    icon: 'inv_misc_food_139_fish',
  },
  POACHED_NETTLEFISH: {
    id: 57100,
    name: 'Poached Nettlefish',
    icon: 'inv_misc_food_138_fish',
  },
  WORM_DELIGHT: {
    id: 57286,
    name: 'Worm Delight',
    icon: 'inv_misc_food_124_skewer',
  },
  CUTTLESTEAK: {
    id: 57365,
    name: 'Cuttlesteak',
    icon: 'inv_misc_food_133_meat',
  },
} satisfies Record<string, Spell>;

export default spells;
