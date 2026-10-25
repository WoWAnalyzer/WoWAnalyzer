import Item from '../Item';

const trinkets = {
  // Season 1
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
  // Delves & Questing
  DRUM_OF_RENEWED_BONDS: {
    id: 248583,
    name: 'Drum of Renewed Bonds',
    icon: 'inv_archaeology_70_tauren_drum',
  },
  COSMIC_BELL: {
    id: 264701,
    name: 'Cosmic Bell',
    icon: 'inv_11_0_arathordungeon_bell_color4',
  },
  CHIRAL_MARROWGRAFTER: {
    id: 274494,
    name: 'Chiral Marrowgrafter',
    icon: 'inv_-misc_herb_marrowroot_leaf',
  },
  TANGLE_OF_VIBRANT_VINES: {
    id: 252957,
    name: 'Tangle of Vibrant Vines',
    icon: 'spell_nature_thorns',
  },
  CONSECRATED_CHALICE: {
    id: 251789,
    name: 'Consecrated Chalice',
    icon: 'inv_offhand_pvealliance_d_01',
  },
  GIFT_OF_LIGHT: {
    id: 251788,
    name: 'Gift of Light',
    icon: 'inv_ability_holyfire_buff',
  },
  PULSE_SEEKERS_OCULUS: {
    id: 274495,
    name: "Pulse Seeker's Oculus",
    icon: 'inv_bfa_paragoncache_tortollanseekers',
  },
  EFFIGY_OF_ULATEKS_FAITHFUL: {
    id: 274493,
    name: "Effigy of Ula'tek's Faithful",
    icon: 'ability_fomor_boss_rune_green',
  },
  GLORIUS_CRUSADERS_KEEPSAKE: {
    id: 251792,
    name: "Glorious Crusader's Keepsake",
    icon: 'inv_12_trinket_gloriuscrusaderskeepsake',
  },
  CRUCIBLE_OF_ERRATIC_ENERGIES: {
    id: 264507,
    name: 'Crucible of Erratic Energies',
    icon: 'inv_112_raidtrinkets_etherealenergystoragebattery_gold',
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
  SOULCOILER_RITUAL_VESSEL: {
    id: 270162,
    name: 'Soulcoiler Ritual Vessel',
    icon: 'inv_121_trinket_raid_ulatek_ritualvessel',
  },
  PRETERNATURAL_ANTIVENOM: {
    id: 270171,
    name: 'Preternatural Antivenom',
    icon: 'inv_11_0_dungeon_tentaclevial_green',
  },
  //The Unbinding of Kith'ix
  SIGIL_OF_THE_IMPENDING_ECLIPSE: {
    id: 280835,
    name: 'Sigil of the Impending Eclipse',
    icon: '8268562', //no name on wowhead
  },
  TWISTED_HORRORS_TENDRIL: {
    id: 281215,
    name: "Twisted Horror's Tendril",
    icon: 'inv_cosmicvoid_groundstate',
  },
  // Season 2 (Mythic+ dungeon pool)
  SEED_OF_RADIANT_HOPE: {
    id: 250254,
    name: 'Seed of Radiant Hope',
    icon: 'inv12_jewelrytrinkets_dungeon_seedofradianthope',
  },
  MYCOLIC_MEDICINE: {
    id: 250248,
    name: 'Mycolic Medicine',
    icon: 'inv_misc_starspecklemushroom',
  },
  UNSTABLE_FELHEART_CRYSTAL: {
    id: 250255,
    name: 'Unstable Felheart Crystal',
    icon: 'tooltip_crystallizedfel',
  },
  FREIGHTRUNNERS_FLASK: {
    id: 250215,
    name: 'Freightrunners Flask',
    icon: 'inv_alchemy_90_flask_red',
  },
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
  // Returning BFA dungeon trinket (King's Rest), hence the old item ID
  STORMBOUND_EMBLEM_OF_DAZAR: {
    id: 273649,
    name: 'Stormbound Emblem of Dazar',
    icon: 'inv_7_0raid_necklace_14a',
  },
  // Returning DF dungeon trinket (Ruby Life Pools), hence the old item ID
  RUBY_WHELP_SHELL: {
    id: 193757,
    name: 'Ruby Whelp Shell',
    icon: 'inv_item_dragonegg_redbroken01',
  },
  // Returning DF dungeon trinket (Ruby Life Pools), hence the old item ID
  KYRAKKAS_SEARING_EMBERS: {
    id: 193748,
    name: "Kyrakka's Searing Embers",
    icon: 'inv_10_dungeonjewelry_primalist_trinket_4_fire',
  },
  // Season 2 (PvP)
  VENOMOUS_GLADIATORS_BADGE_OF_FEROCITY: {
    id: 270602,
    name: "Venomous Gladiator's Badge of Ferocity",
    icon: 'spell_holy_championsbond',
  },
  VENOMOUS_GLADIATORS_BADGE_OF_ALACRITY: {
    id: 270603,
    name: "Venomous Gladiator's Insignia of Alacrity",
    icon: 'inv_misc_token_argentdawn3',
  },
} satisfies Record<string, Item>;

export default trinkets;
