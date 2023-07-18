import Spell from '../Spell';

const spells = {
  //region Drinks
  CHURNBELLY_TEA: {
    id: 383212,
    name: 'Churnbelly Tea',
    icon: 'inv_drink_19',
  },
  //endregion

  //region Desserts
  FATED_FORTUNE_COOKIE: {
    id: 396092,
    name: 'Fated Fortune Cookie',
    icon: 'inv_misc_fortunecookie_color03',
  },
  //endregion

  //region Meat Meals
  BRAISED_BRUFFALON_BRISKET: {
    id: 382234,
    name: 'Braised Bruffalon Brisket',
    icon: 'inv_misc_food_meat_cooked_06',
  },
  CHARRED_HORNSWOG_STEAKS: {
    id: 382230,
    name: 'Charred Hornswog Steaks',
    icon: 'inv_cooking_81_paleosteakandpotatoes_color02',
  },
  RIVERSIDE_PICNIC: {
    id: 382235,
    name: 'Riverside Picnic',
    icon: 'inv_misc_food_99',
  },
  ROAST_DUCK_DELIGHT: {
    id: 382236,
    name: 'Roast Duck Delight',
    icon: 'inv_cooking_100_roastduck_color02',
  },
  SALTED_MEAT_MASH: {
    id: 382247,
    name: 'Salted Meat Mash',
    icon: 'inv_misc_food_meat_raw_01_color02',
  },
  SCRAMBLED_BASILISK_EGGS: {
    id: 382231,
    name: 'Scrambled Basilisk Eggs',
    icon: 'inv_thanksgiving_stuffing',
  },
  THRICE_SPICED_MAMMOTH_KABOB: {
    id: 382232,
    name: 'Thrice-Spiced Mammoth Kabob',
    icon: 'inv_misc_food_legion_spicedribroast',
  },
  HOPEFULLY_HEALTHY: {
    id: 382246,
    name: 'Hopefully Healthy',
    icon: 'inv_misc_food_meat_cooked_04',
  },
  //endregion

  //region Simple Fish Dishes
  FILET_OF_FANGS: {
    id: 382146,
    name: 'Filet of Fangs',
    icon: 'inv_misc_food_cooked_eternalblossomfish',
  },
  SALT_BAKED_FISHCAKE: {
    id: 382150,
    name: 'Salt-Baked Fishcake',
    icon: 'inv_misc_food_legion_deepfriedmossgill',
  },
  SEAMOTH_SURPRISE: {
    id: 382149,
    name: 'Seamoth Surprise',
    icon: 'inv_misc_food_159_fish_82',
  },
  TIMELY_DEMISE: {
    id: 382145,
    name: 'Timely Demise',
    icon: 'inv_misc_food_legion_seedbatteredfishplate',
  },
  //endregion

  //region Deluxe Fish Dishes
  AROMATIC_SEAFOOD_PLATTER: {
    id: 382153,
    name: 'Aromatic Seafood Platter',
    icon: 'inv_misc_food_legion_drogbarstylesalmon',
  },
  FIESTY_FISH_STICKS: {
    id: 382152,
    name: 'Fiesty Fish Sticks',
    icon: 'inv_misc_food_164_fish_seadog',
  },
  GREAT_CERULEAN_SEA: {
    id: 382157,
    name: 'Great Cerulean Sea',
    icon: 'inv_misc_food_159_fish_white',
  },
  REVENGE_SERVED_COLD: {
    id: 382155,
    name: 'Revenge, Served Cold',
    icon: 'inv_cooking_100_revengeservedcold_color02',
  },
  SIZZLING_SEAFOOD_MEDLEY: {
    id: 382154,
    name: 'Sizzling Seafood Medley',
    icon: 'inv_misc_food_draenor_sturgeonstew',
  },
  THOUSANDBONE_TONGUESLICER: {
    id: 382156,
    name: 'Thousandbone Tongueslicer',
    icon: 'inv_misc_food_154_fish_77',
  },
  //endregion

  //region Great Feasts
  // TODO: Get Spell ID
  // YUSAS_HEARTY_STEW: {
  //   id: 382146,
  //   name: "Yusa's Hearty Stew",
  //   icon: 'inv_cooking_10_heartystew',
  // },

  // Both Hoard and Banquet share their food buff ID with Fated Fortune Cookie.
  // HOARD_OF_DRACONIC_DELICACIES: {
  //   id: 396092,
  //   name: 'Hoard of Draconic Delicacies',
  //   icon: 'inv_cooking_10_draconicdelicacies',
  // },
  // GRAND_BANQUET_OF_THE_KALUAK: {
  //   id: 396092,
  //   name: "Grand Banquet of the Kalu'ak",
  //   icon: 'inv_cooking_10_grandbanquet',
  // },
  //endregion
} satisfies Record<string, Spell>;

export default spells;
