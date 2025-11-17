import Spell from '../Spell';

const food = {
  /**
   * 30 Fishing Skill, 150 Perception
   */
  GHOULFISH_DELIGHT: {
    id: 456406,
    name: 'Ghoulfish Delight',
    icon: 'inv_cooking_90_cinnamonbonefishstew',
  },
  /**
   * Supposed to give Lowest Secondary Stat and 1% size
   *
   * But right now resotres 0 mana per second until you stand up.
   */
  PROTEIN_SLURP: {
    id: 456576,
    name: 'Protein Slurp',
    icon: 'inv_cooking_90_pickledmeatsmoothie_color03',
  },
  /** 582 Speed */
  EXQUISITELY_EVISERATED_MUSCLE: {
    id: 455369,
    name: 'Exquisitely Eviscerated Muscle',
    icon: 'inv_misc_food_84_roastclefthoof',
  },

  // #region 496 Secondary Stats
  /**
   * 469 Mastery
   *
   * - The Sushi Special
   * - Beledar's Bounty
   * - Jester's Board
   * - Empress' Farewell
   * - Outsider's Provisions
   * - Everything Stew
   */
  WELL_FED_469_MASTERY: {
    id: 461957,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 469 Versatility
   *
   * - The Sushi Special
   * - Beledar's Bounty
   * - Jester's Board
   * - Empress' Farewell
   * - Outsider's Provisions
   * - Everything Stew
   */
  WELL_FED_469_VERSATILITY: {
    id: 461958,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 469 Crit
   *
   * - The Sushi Special
   * - Beledar's Bounty
   * - Jester's Board
   * - Empress' Farewell
   * - Outsider's Provisions
   * - Everything Stew
   */
  WELL_FED_469_CRIT: {
    id: 461959,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 469 Haste
   *
   * - The Sushi Special
   * - Beledar's Bounty
   * - Jester's Board
   * - Empress' Farewell
   * - Outsider's Provisions
   * - Everything Stew
   */
  WELL_FED_469_HASTE: {
    id: 461960,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },

  /**
   * 469 Haste - Hearty
   *
   * - Hearty Sushi Special
   * - Hearty Beledar's Bounty
   * - Hearty Jester's Board
   * - Hearty Empress' Farewell
   * - Hearty Outsider's Provisions
   * - Hearty Everything Stew
   */
  HEARTY_WELL_FED_469_HASTE: {
    id: 462180,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 469 Crit - Hearty
   *
   * - Hearty Sushi Special
   * - Hearty Beledar's Bounty
   * - Hearty Jester's Board
   * - Hearty Empress' Farewell
   * - Hearty Outsider's Provisions
   * - Hearty Everything Stew
   */
  HEARTY_WELL_FED_469_CRIT: {
    id: 462181,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 469 Versatility - Hearty
   *
   * - Hearty Sushi Special
   * - Hearty Beledar's Bounty
   * - Hearty Jester's Board
   * - Hearty Empress' Farewell
   * - Hearty Outsider's Provisions
   * - Hearty Everything Stew
   */
  HEARTY_WELL_FED_469_VERSATILITY: {
    id: 462182,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 469 Mastery - Hearty
   *
   * - Hearty Sushi Special
   * - Hearty Beledar's Bounty
   * - Hearty Jester's Board
   * - Hearty Empress' Farewell
   * - Hearty Outsider's Provisions
   * - Hearty Everything Stew
   */
  HEARTY_WELL_FED_469_MASTERY: {
    id: 462183,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion 496 Secondary Stats

  /**
   * 446 Primary Stat
   *
   * - Feast of the Divine Day
   * - Feast of the Midnight Masquerade
   */
  WELL_FED_PRIMARY_FEAST: {
    id: 457284,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 446 Primary Stat
   *
   * - Hearty Feast of the Divine Day
   * - Hearty Feast of the Midnight Masquerade
   */
  HEARTY_WELL_FED_PRIMARY_FEAST: {
    id: 462210,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },

  // #region Snacks - 328 Secondary Stats (15 Min) ----------------------------
  /**
   * 328 Mastery (15 min)
   *
   * - Simple Stew
   * - Skewered Fillet
   * - Unseasoned Field Steak
   * - Spongey Scramble
   * - Roasted Mycobloom
   */
  WELL_FED_328_MASTERY_15: {
    id: 461942,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Versatility (15 min)
   *
   * - Simple Stew
   * - Skewered Fillet
   * - Unseasoned Field Steak
   * - Spongey Scramble
   * - Roasted Mycobloom
   */
  WELL_FED_328_VERSATILITY_15: {
    id: 461943,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Crit (15 min)
   *
   * - Simple Stew
   * - Skewered Fillet
   * - Unseasoned Field Steak
   * - Spongey Scramble
   * - Roasted Mycobloom
   */
  WELL_FED_328_CRIT_15: {
    id: 461944,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Haste (15 min)
   *
   * - Simple Stew
   * - Skewered Fillet
   * - Unseasoned Field Steak
   * - Spongey Scramble
   * - Roasted Mycobloom
   */
  WELL_FED_328_HASTE_15: {
    id: 461945,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },

  /**
   * 328 Haste (15 min) - Hearty
   *
   * - Hearty Simple Stew
   * - Hearty Skewered Fillet
   * - Hearty Unseasoned Field Steak
   * - Hearty Spongey Scramble
   * - Hearty Roasted Mycobloom
   */
  HEARTY_WELL_FED_328_HASTE_15: {
    id: 462188,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Crit (15 min) - Hearty
   *
   * - Hearty Simple Stew
   * - Hearty Skewered Fillet
   * - Hearty Unseasoned Field Steak
   * - Hearty Spongey Scramble
   * - Hearty Roasted Mycobloom
   */
  HEARTY_WELL_FED_328_CRIT_15: {
    id: 462189,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Versatility (15 min) - Hearty
   *
   * - Hearty Simple Stew
   * - Hearty Skewered Fillet
   * - Hearty Unseasoned Field Steak
   * - Hearty Spongey Scramble
   * - Hearty Roasted Mycobloom
   */
  HEARTY_WELL_FED_328_VERSATILITY_15: {
    id: 462190,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Mastery (15 min) - Hearty
   *
   * - Hearty Simple Stew
   * - Hearty Skewered Fillet
   * - Hearty Unseasoned Field Steak
   * - Hearty Spongey Scramble
   * - Hearty Roasted Mycobloom
   */
  HEARTY_WELL_FED_328_MASTERY_15: {
    id: 462191,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Snacks - 328 Secondary Stats (15 Min) -------------------------

  // #region Quik and easy - 328 Secondary Stats (30 Min) ---------------------
  /**
   * 328 Haste (30 min)
   *
   * - Coreway Kabob
   * - Flash Fire Fillet
   * - Hallowfall Chili
   * - Pan Seared Mycobloom
   */
  WELL_FED_328_HASTE_30: {
    id: 461937,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Crit (30 min)
   *
   * - Coreway Kabob
   * - Flash Fire Fillet
   * - Hallowfall Chili
   * - Pan Seared Mycobloom
   */
  WELL_FED_328_CRIT_30: {
    id: 461938,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Versatility (30 min)
   *
   * - Coreway Kabob
   * - Flash Fire Fillet
   * - Hallowfall Chili
   * - Pan Seared Mycobloom
   */
  WELL_FED_328_VERSATILITY_30: {
    id: 461939,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Mastery (30 min)
   *
   * - Coreway Kabob
   * - Flash Fire Fillet
   * - Hallowfall Chili
   * - Pan Seared Mycobloom
   */
  WELL_FED_328_MASTERY_30: {
    id: 461940,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },

  /**
   * 328 Mastery (30 min) - Hearty
   *
   * - Hearty Coreway Kabob
   * - Hearty Flash Fire Fillet
   * - Hearty Hallowfall Chili
   * - Hearty Pan Seared Mycobloom
   */
  HEARTY_WELL_FED_328_MASTERY_30: {
    id: 462192,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Versatility (30 min) - Hearty
   *
   * - Hearty Coreway Kabob
   * - Hearty Flash Fire Fillet
   * - Hearty Hallowfall Chili
   * - Hearty Pan Seared Mycobloom
   */
  HEARTY_WELL_FED_328_VERSATILITY_30: {
    id: 462193,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Crit (30 min) - Hearty
   *
   * - Hearty Coreway Kabob
   * - Hearty Flash Fire Fillet
   * - Hearty Hallowfall Chili
   * - Hearty Pan Seared Mycobloom
   */
  HEARTY_WELL_FED_328_CRIT_30: {
    id: 462194,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  /**
   * 328 Haste (30 min) - Hearty
   *
   * - Hearty Coreway Kabob
   * - Hearty Flash Fire Fillet
   * - Hearty Hallowfall Chili
   * - Hearty Pan Seared Mycobloom
   */
  HEARTY_WELL_FED_328_HASTE_30: {
    id: 462195,
    name: 'Hearty Well Fed',
    icon: 'spell_misc_food',
  },
  // #endregion Quik and easy - 328 Secondary Stats (30 Min) ------------------

  // #region A Full Belly - 235 x 2 Secondary Stats ---------------------------
  /** 235 Crit+Mastery */
  SALT_BAKED_SEAFOOD: {
    id: 461835,
    name: 'Salt Baked Seafood',
    icon: 'inv_misc_food_draenor_saltedskulker',
  },
  /** 235 Crit+Mastery */
  HEARTY_SALT_BAKED_SEAFOOD: {
    id: 462208,
    name: 'Hearty Salt Baked Seafood',
    icon: 'inv_misc_food_draenor_saltedskulker',
  },
  /** 235 Versatility+Mastery */
  MARINATED_TENDERLOINS: {
    id: 461845,
    name: 'Marinated Tenderloins',
    icon: 'inv_misc_food_meat_cooked_02',
  },
  /** 235 Versatility+Mastery */
  HEARTY_MARINATED_TENDERLOINS: {
    id: 462209,
    name: 'Hearty Marinated Tenderloins',
    icon: 'inv_misc_food_meat_cooked_02',
  },
  /** 235 Crit+Versatility */
  FISH_AND_CHIPS: {
    id: 461854,
    name: 'Fish and Chips',
    icon: 'inv_cooking_80_swampfishnchips',
  },
  /** 235 Crit+Versatility */
  HEARTY_FISH_AND_CHIPS: {
    id: 462207,
    name: 'Hearty Fish and Chips',
    icon: 'inv_cooking_80_swampfishnchips',
  },
  /** 235 Haste+Mastery */
  CHIPPY_TEA: {
    id: 461855,
    name: 'Chippy Tea',
    icon: 'inv_misc_food_vendor_roastedbarlytea',
  },
  /** 235 Haste+Mastery */
  HEARTY_CHIPPY_TEA: {
    id: 462206,
    name: 'Hearty Chippy Tea',
    icon: 'inv_misc_food_vendor_roastedbarlytea',
  },
  /** 235 Haste+Versatility */
  SWEET_AND_SPICY_SOUP: {
    id: 461856,
    name: 'Sweet and Spicy Soup',
    icon: 'inv_misc_food_vendor_tangypeachyogurt',
  },
  /** 235 Haste+Versatility */
  HEARTY_SWEET_AND_SPICY_SOUP: {
    id: 462205,
    name: 'Hearty Sweet and Spicy Soup',
    icon: 'inv_misc_food_vendor_tangypeachyogurt',
  },
  /** 235 Haste+Crit */
  DEEPFIN_PATTY: {
    id: 461857,
    name: 'Deepfin Patty',
    icon: 'inv_misc_food_vendor_poundedricecakes',
  },
  /** 235 Haste+Crit */
  HEARTY_DEEPFIN_PATTY: {
    id: 462204,
    name: 'Hearty Deepfin Patty',
    icon: 'inv_misc_food_vendor_poundedricecakes',
  },
  // #endregion A Full Belly - 235 x 2 Secondary Stats ------------------------

  // #region A Full Belly - 328 Secondary Stats (60min) -----------------------
  /** 328 Mastery */
  SALTY_DOG: {
    id: 461858,
    name: 'Salty Dog',
    icon: 'inv_cooking_81_honeypotpie',
  },
  /** 328 Mastery */
  HEARTY_SALTY_DOG: {
    id: 462203,
    name: 'Hearty Salty Dog',
    icon: 'inv_cooking_81_honeypotpie',
  },
  /** 328 Versatility */
  GINGER_GLAZED_FILLET: {
    id: 461859,
    name: 'Ginger Glazed Fillet',
    icon: 'inv_cooking_82_moistfillet',
  },
  /** 328 Versatility */
  HEARTY_GINGER_GLAZED_FILLET: {
    id: 462202,
    name: 'Hearty Ginger Glazed Fillet',
    icon: 'inv_cooking_82_moistfillet',
  },
  /** 328 Critical Strike */
  FIERY_FISH_STICKS: {
    id: 461860,
    name: 'Fiery Fish Sticks',
    icon: 'inv_misc_fish_18',
  },
  /** 328 Critical Strike */
  HEARTY_FIERY_FISH_STICKS: {
    id: 462201,
    name: 'Hearty Fiery Fish Sticks',
    icon: 'inv_misc_fish_18',
  },
  /** 328 Haste */
  ZESTY_NIBBLERS: {
    id: 461861,
    name: 'Zesty Nibblers',
    icon: 'inv_misc_food_86_basilisk',
  },
  /** 328 Haste */
  HEARTY_ZESTY_NIBBLERS: {
    id: 462200,
    name: 'Hearty Zesty Nibblers',
    icon: 'inv_misc_food_86_basilisk',
  },
  // #endregion A Full Belly - 328 Secondary Stats (60min) --------------------

  // #region A Full Belly - Stamina + 223 Primary -----------------------------
  /** 446 Stamina, 223 Intellect */
  STUFFED_CAVE_PEPPERS: {
    id: 461922,
    name: 'Stuffed Cave Peppers',
    icon: 'inv_cooking_90_smuggledproduce',
  },
  /** 446 Stamina, 223 Intellect */
  HEARTY_STUFFED_CAVE_PEPPERS: {
    id: 462199,
    name: 'Hearty Stuffed Cave Peppers',
    icon: 'inv_cooking_90_smuggledproduce',
  },
  /** 446 Stamina, 223 Agility */
  MYCOBLOOM_RISOTTO: {
    id: 461924,
    name: 'Mycobloom Risotto',
    icon: 'inv_cooking_80_sailorspie',
  },
  /** 446 Stamina, 223 Agility */
  HEARTY_MYCOBLOOM_RISOTTO: {
    id: 462198,
    name: 'Hearty Mycobloom Risotto',
    icon: 'inv_cooking_80_sailorspie',
  },
  /** 446 Stamina, 223 Strength */
  SIZZLING_HONEY_ROAST: {
    id: 461925,
    name: 'Sizzling Honey Roast',
    icon: 'inv_cooking_100_roastduck',
  },
  /** 446 Stamina, 223 Strength */
  HEARTY_SIZZLING_HONEY_ROAST: {
    id: 462197,
    name: 'Hearty Sizzling Honey Roast',
    icon: 'inv_cooking_100_roastduck',
  },
  // #endregion A Full Belly - Stamina + 223 Primary --------------------------

  // #region A Full Belly - Stamina -------------------------------------------
  /** 892 Stamina */
  ANGLERS_DELIGHT: {
    id: 461927,
    name: "Angler's Delight",
    icon: 'inv_cooking_100_revengeservedcold_color04',
  },
  /** 892 Stamina */
  HEARTY_ANGLERS_DELIGHT: {
    id: 462196,
    name: "Hearty Angler's Delight",
    icon: 'inv_cooking_100_revengeservedcold_color04',
  },
  /** 625 Stamina */
  TENDER_TWILIGHT_JERKY: {
    id: 461946,
    name: 'Tender Twilight Jerky',
    icon: 'inv_misc_food_79',
  },
  /** 625 Stamina */
  HEARTY_TENDER_TWILIGHT_JERKY: {
    id: 462187,
    name: 'Hearty Tender Twilight Jerky',
    icon: 'inv_misc_food_79',
  },
  // #endregion A Full Belly - Stamina ----------------------------------------

  // #region A Full Belly - Stamina + 156 Primary -----------------------------
  /** 312 Stamina, 156 Strength */
  MEAT_AND_POTATOES: {
    id: 461947,
    name: 'Meat and Potatoes',
    icon: 'inv_misc_food_cooked_eternalblossomfish',
  },
  /** 312 Stamina, 156 Strength */
  HEARTY_MEAT_AND_POTATOES: {
    id: 462186,
    name: 'Hearty Meat and Potatoes',
    icon: 'inv_misc_food_cooked_eternalblossomfish',
  },
  /** 312 Stamina, 156 Agility */
  RIB_STICKERS: {
    id: 461948,
    name: 'Rib Stickers',
    icon: 'inv_misc_food_88_ravagernuggets',
  },
  /** 312 Stamina, 156 Agility */
  HEARTY_RIB_STICKERS: {
    id: 462185,
    name: 'Hearty Rib Stickers',
    icon: 'inv_misc_food_88_ravagernuggets',
  },
  /** 312 Stamina, 156 Intellect */
  SWEET_AND_SOUR_MEATBALLS: {
    id: 461949,
    name: 'Sweet and Sour Meatballs',
    icon: 'inv_misc_food_mango_ice',
  },
  /** 312 Stamina, 156 Intellect */
  HEARTY_SWEET_AND_SOUR_MEATBALLS: {
    id: 462184,
    name: 'Hearty Sweet and Sour Meatballs',
    icon: 'inv_misc_food_mango_ice',
  },
  // #endregion A Full Belly - Stamina + 156 Primary --------------------------
  // #region Earthen racial food buffs
  EARTHEN_WELL_FED_HASTE: {
    id: 451916,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  EARTHEN_WELL_FED_VERS: {
    id: 451917,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  EARTHEN_WELL_FED_CRIT: {
    id: 451918,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },
  EARTHEN_WELL_FED_MASTERY: {
    id: 451920,
    name: 'Well Fed',
    icon: 'spell_misc_food',
  },

  // #endregion Earthen racial food buffs
} satisfies Record<string, Spell>;

export default food;
