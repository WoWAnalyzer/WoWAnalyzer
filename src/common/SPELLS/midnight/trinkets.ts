import Spell from '../Spell';

const spells = {
  EYE_OF_THE_DROWNING_VOID: {
    id: 1255476,
    name: 'Eye of the Drowning Void',
    icon: 'inv_archaeology_70_tauren_moosebonefishhook.jpg',
  },
  VOID_SUFFUSION: {
    id: 1258534,
    name: 'Void Suffusion',
    icon: 'inv_12_trinket_raid_voidspire_healer1_volatilevoidsuffuser',
  },
  COSMIC_CRESCENDO: {
    id: 1264948,
    name: 'Cosmic Crescendo',
    icon: 'inv_12_trinket_raid_darkwelle_healer3_cosmiccrescendo',
  },
  COSMIC_HYMN: {
    id: 1265019,
    name: 'Cosmic Hymn',
    icon: 'inv_12_trinket_raid_darkwelle_healer3_cosmiccrescendo',
  },
  FANATICAL_INSPIRATION: {
    id: 1266299,
    name: 'Fanatical Inspiration',
    icon: 'inv_12_trinket_gloriuscrusaderskeepsake',
  },
  FREIGHTRUNNERS_FLASK: {
    id: 1250533,
    name: 'Freightrunners Flask',
    icon: 'inv_alchemy_90_flask_red',
  },
  AKILZONS_CLARITY: {
    id: 1247577,
    name: "Akilzon's Clarity",
    icon: 'inv_archaeology_70_tauren_drum',
  },
  LIGHTS_BLESSING: {
    id: 1263768,
    name: "Light's Blessing",
    icon: 'inv_lightforgedmatrixability_lightsjudgment',
  },
  // Zul'jin's Guillotine Technique
  GUILLOTINE_DRIVER: {
    id: 1291728,
    name: 'Guillotine',
    icon: 'inv_121_trinket_raid_ulatek_trolltablet',
  },
  GUILLOTINE_DAMAGE: {
    id: 1306604,
    name: 'Guillotine',
    icon: 'inv_121_trinket_raid_ulatek_trolltablet',
  },
  // Guillotine upgrades with the Bite of Zul'jan weapon 2-set
  PERFECTED_GUILLOTINE_DAMAGE: {
    id: 1306624,
    name: 'Perfected Guillotine',
    icon: 'inv_121_trinket_raid_ulatek_trolltablet',
  },
  VENOMFANG_DAMAGE: {
    id: 1291718,
    name: 'Venomfang',
    icon: 'inv_121_trinket_raid_ulatek_fang_green',
  },
  // Voracious Heart of Ula'tek
  VORACIOUS_HEART_OF_ULATEK_BUFF: {
    id: 1297761,
    name: "Voracious Heart of Ula'tek",
    icon: 'inv_121_trinket_raid_ulatek_heart',
  },
  DEVOURED_STRENGTH_BUFF: {
    id: 1305376,
    name: 'Devoured Strength',
    icon: 'ability_druid_primaltenacity',
  },
  DEVOUR_MORSEL_DAMAGE: {
    id: 1305374,
    name: 'Devour Morsel',
    icon: 'ability_druid_primaltenacity',
  },
  // Gebbo's Bottomless Bag: the driver pulls one of six random "artifact" stat buffs
  GEBBOS_BOTTOMLESS_BAG_DRIVER: {
    id: 1292291,
    name: "Gebbo's Bottomless Bag",
    icon: 'trade_engineering',
  },
  SERIOUSLY_SHARP_SEASHELL_BUFF: {
    id: 1292299,
    name: 'Seriously Sharp Seashell',
    icon: 'inv_misc_food_legion_seashelld2',
  },
  TATTERED_TORTOLLAN_SCROLL_BUFF: {
    id: 1306870,
    name: 'Tattered Tortollan Scroll',
    icon: 'inv_10_inscription2_repcontracts_70_professions_scroll_02_uprez_color4',
  },
  BRITTLE_TORGA_TOTEM_BUFF: {
    id: 1292300,
    name: 'Brittle Torga Totem',
    icon: 'inv_cape_special_totembackpack_b_01',
  },
  SLICK_AND_SLIMY_GRALSTONE_BUFF: {
    id: 1308012,
    name: 'Slick and Slimy Gralstone',
    icon: 'inv_alchemist_81_eternalalchemiststone',
  },
  FIFTY_LB_MIDNIGHT_SALMON_BUFF: {
    id: 1308013,
    name: '50-Lb Midnight Salmon',
    icon: 'inv_misc_fish_35',
  },
  ROTTING_VOIDFIN_DEBUFF: {
    id: 1308014,
    name: 'Rotting Voidfin',
    icon: 'inv_misc_fish_96',
  },
  // First Mate's Shellward
  FIRST_MATES_SHELLWARD_CAST: {
    id: 1295328,
    name: "First Mate's Shellward",
    icon: 'inv_cape_special_turtleshell_c_02',
  },
  FIRST_MATES_SHELLWARD_ABSORB: {
    id: 1295323,
    name: "First Mate's Shellward",
    icon: 'inv_cape_special_turtleshell_c_02',
  },
  // Tumor of the Swarm
  CRAWLING_PLAGUE_DRIVER: {
    id: 1250589,
    name: 'Crawling Plague',
    icon: 'ability_pet_baneling',
  },
  CRAWLING_PLAGUE_ABSORB: {
    id: 1264146,
    name: 'Crawling Plague',
    icon: 'ability_pet_baneling',
  },
  CRAWLING_PLAGUE_ABSORB_ALT: {
    id: 1264156,
    name: 'Crawling Plague',
    icon: 'ability_pet_baneling',
  },
  PERMAFROST_RESERVOIR: {
    id: 1260321,
    name: 'Permafrost Reservoir',
    icon: 'inv_10_specialreagentfoozles_tuskclaw-ice',
  },
  // Idol of the Howling Nexus
  IDOL_OF_THE_HOWLING_NEXUS_DRIVER: {
    id: 1295643,
    name: 'Idol of the Howling Nexus',
    icon: 'inv_jewelcrafting_jadeserpent',
  },
  IMMINENT_GALE_BUFF: {
    id: 1306822,
    name: 'Imminent Gale',
    icon: 'ability_skyreach_wind',
  },
  // Vile Vial of Volatile Venom
  EMPOWERING_VENOM_BUFF: {
    id: 1293316,
    name: 'Empowering Venom',
    icon: 'inv_121_trinket_dungeon_ulatek_vile',
  },
  DEBILITATING_VENOM_DEBUFF: {
    id: 1295123,
    name: 'Debilitating Venom',
    icon: 'inv_121_trinket_dungeon_ulatek_vile',
  },
  VILE_VIAL_OF_VOLATILE_VENOM_EQUIP: {
    id: 1295179,
    name: 'Vile Vial of Volatile Venom',
    icon: 'inv_121_trinket_dungeon_ulatek_vile',
  },
  // Font of Venomous Rage
  FONT_OF_VENOMOUS_RAGE_CAST: {
    id: 1297908,
    name: 'Font of Venomous Rage',
    icon: 'inv_10_dungeonjewelry_dragon_trinket_3djardintrophy_green',
  },
  FONT_OF_VENOMOUS_RAGE_EQUIP: {
    id: 1297911,
    name: 'Font of Venomous Rage',
    icon: 'inv_10_dungeonjewelry_dragon_trinket_3djardintrophy_green',
  },
  VENOM_SPLATTER_DAMAGE: {
    id: 1307222,
    name: 'Venom Splatter',
    icon: 'inv_10_dungeonjewelry_dragon_trinket_3djardintrophy_green',
  },
  // Wavecaller's Seastone
  WAVECALLERS_SEASTONE_DRIVER: {
    id: 1295058,
    name: "Wavecaller's Seastone",
    icon: 'inv_tradeskillitem_sorcererswater',
  },
  TIDAL_INSIGHT_BUFF: {
    id: 1295057,
    name: 'Tidal Insight',
    icon: 'inv_tradeskillitem_sorcererswater',
  },
  // Sapling of the Dawnroot
  SAPLING_OF_THE_DAWNROOT_DRIVER: {
    id: 1250604,
    name: 'Sapling of the Dawnroot',
    icon: 'inv_misc_herb_nightmarevine',
  },
  UPROOTED_LASHER_SUMMON: {
    id: 1263077,
    name: 'Uprooted Lasher',
    icon: 'inv_misc_herb_nightmarevine',
  },
  LIGHTBLOOM_LASHING: {
    id: 1263101,
    name: 'Lightbloom Lashing',
    icon: 'inv_misc_herb_nightmarevine',
  },
  SAPPY_DEMISE_DAMAGE: {
    id: 1263121,
    name: 'Sappy Demise',
    icon: 'inv_misc_food_legion_goochocovanilla_pool',
  },
  // Vexhul's Everflowing Gland
  VEXHULS_EVERFLOWING_GLAND_CAST: {
    id: 1295833,
    name: "Vexhul's Everflowing Gland",
    icon: 'inv_11_0_misc_organmass_color3',
  },
  VEXHULS_EVERFLOWING_GLAND_DAMAGE: {
    id: 1306785,
    name: "Vexhul's Everflowing Gland",
    icon: 'inv_11_0_misc_organmass_color3',
  },
  VEXHULS_EVERFLOWING_GLAND_EQUIP: {
    id: 1295832,
    name: "Vexhul's Everflowing Gland",
    icon: 'inv_11_0_misc_organmass_color3',
  },
} satisfies Record<string, Spell>;

export default spells;
