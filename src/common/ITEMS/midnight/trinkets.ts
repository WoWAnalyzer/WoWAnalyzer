import Item from '../Item';

const trinkets = {
  VOLATILE_VOID_SUFFUSER: {
    id: 249341,
    name: 'Volatile Void Suffuser',
    icon: 'inv_12_trinket_raid_voidspire_healer1_volatilevoidsuffuser',
  },
  LIGHT_OF_THE_COSMIC_CRESCENDO: {
    id: 249811,
    name: 'Light of the Cosmic Crescendo',
    icon: 'inv_12_trinket_raid_darkwelle_healer3_cosmiccrescendo',
  },
  FREIGHTRUNNERS_FLASK: {
    id: 250215,
    name: 'Freightrunners Flask',
    icon: 'inv_alchemy_90_flask_red',
  },
  DRUM_OF_RENEWED_BONDS: {
    id: 248583,
    name: 'Drum of Renewed Bonds',
    icon: 'inv_archaeology_70_tauren_drum',
  },
  // Season 2 (Venomous Abyss raid)
  ZULJINS_GUILLOTINE_TECHNIQUE: {
    id: 270173,
    name: "Zul'jin's Guillotine Technique",
    icon: 'inv_121_trinket_raid_ulatek_trolltablet',
  },
  VORACIOUS_HEART_OF_ULATEK: {
    id: 270175,
    name: "Voracious Heart of Ula'tek",
    icon: 'inv_121_trinket_raid_ulatek_heart',
  },
  GEBBOS_BOTTOMLESS_BAG: {
    id: 270164,
    name: "Gebbo's Bottomless Bag",
    icon: 'inv_10_tailoring_bag1_color2',
  },
  FIRST_MATES_SHELLWARD: {
    id: 270160,
    name: "First Mate's Shellward",
    icon: 'inv_cape_special_turtleshell_c_02',
  },
  IDOL_OF_THE_HOWLING_NEXUS: {
    id: 270174,
    name: 'Idol of the Howling Nexus',
    icon: 'inv_jewelcrafting_jadeserpent',
  },
  FONT_OF_VENOMOUS_RAGE: {
    id: 270168,
    name: 'Font of Venomous Rage',
    icon: 'inv_10_dungeonjewelry_dragon_trinket_3djardintrophy_green',
  },
  WAVECALLERS_SEASTONE: {
    id: 270167,
    name: "Wavecaller's Seastone",
    icon: 'inv_tradeskillitem_sorcererswater',
  },
  KEEPERS_SEETHING_CORE: {
    id: 270165,
    name: "Keeper's Seething Core",
    icon: 'inv_121_trinket_raid_ulatek_golemhearts_green',
  },
  HEX_LORDS_DOOMING_IDOL: {
    id: 270169,
    name: "Hex Lord's Dooming Idol",
    icon: 'inv_archaeology_orcclans_crackedidol',
  },
  // Season 2 (Mythic+ dungeon pool)
  SAPLING_OF_THE_DAWNROOT: {
    id: 250259,
    name: 'Sapling of the Dawnroot',
    icon: 'inv_misc_herb_nightmarevine',
  },
  TUMOR_OF_THE_SWARM: {
    id: 250245,
    name: 'Tumor of the Swarm',
    icon: 'ability_pet_baneling',
  },
  VILE_VIAL_OF_VOLATILE_VENOM: {
    id: 273796,
    name: 'Vile Vial of Volatile Venom',
    icon: 'inv_121_trinket_dungeon_ulatek_vile',
  },
  VEXHULS_EVERFLOWING_GLAND: {
    id: 270170,
    name: "Vexhul's Everflowing Gland",
    icon: 'inv_11_0_misc_organmass_color3',
  },
  IDOL_OF_THE_WAR_LOA: {
    id: 250229,
    name: 'Idol of the War Loa',
    icon: 'inv12_jewelrytrinkets_dungeon_idolofthewargod',
  },
  // Returning BFA dungeon trinket (Temple of Sethraliss), hence the old item ID
  MEREKTHAS_FANG: {
    id: 158367,
    name: "Merektha's Fang",
    icon: 'inv_misc_food_87_sporelingsnack',
  },
  // Season 2 (PvP)
  VENOMOUS_GLADIATORS_BADGE_OF_FEROCITY: {
    id: 270602,
    name: "Venomous Gladiator's Badge of Ferocity",
    icon: 'spell_holy_championsbond',
  },
} satisfies Record<string, Item>;

export default trinkets;
