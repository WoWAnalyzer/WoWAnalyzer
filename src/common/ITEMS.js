import indexById from './indexById';

import ITEM_QUALITIES from './ITEM_QUALITIES';

const ITEMS = {
  POTION_OF_PROLONGED_POWER: {
    id: 142117,
    name: 'Potion of Prolonged Power',
    icon: 'trade_alchemy_dpotion_a28',
  },
  POTION_OF_THE_OLD_WAR: {
    id: 127844,
    name: 'Potion of the Old War',
    icon: 'inv_alchemy_70_orange',
  },
  POTION_OF_DEADLY_GRACE: {
    id: 127843,
    name: 'Potion of Deadly Grace',
    icon: 'inv_alchemy_70_flask02',
  },
  LEYTORRENT_POTION: {
    id: 127846,
    name: 'Leytorrent Potion',
    icon: 'inv_alchemy_70_flask01',
  },
  ANCIENT_MANA_POTION: {
    id: 127835,
    name: 'Ancient Mana Potion',
    icon: 'inv_alchemy_70_blue',
  },
  PRYDAZ_XAVARICS_MAGNUM_OPUS: {
    id: 132444,
    name: 'Prydaz, Xavaric\'s Magnum Opus',
    icon: 'inv_misc_necklace15',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ARCHIMONDES_HATRED_REBORN: {
    id: 144249,
    name: 'Archimonde\'s Hatred Reborn',
    icon: 'spell_nature_elementalshields',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SEPHUZS_SECRET: {
    id: 132452,
    name: 'Sephuz\'s Secret',
    icon: 'inv_jewelry_ring_149',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  VELENS_FUTURE_SIGHT: {
    id: 144258,
    name: 'Velen\'s Future Sight',
    icon: 'spell_holy_healingfocus',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  GNAWED_THUMB_RING: {
    id: 134526,
    name: 'Gnawed Thumb Ring',
    icon: 'inv_70_dungeon_ring6a',
    quality: ITEM_QUALITIES.EPIC,
  },
  AGGRAMARS_STRIDE: {
    id: 132443,
    name: 'Aggramar\'s Stride',
    icon: 'inv_boots_plate_raidpaladin_i_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Shared Paladin
  SOUL_OF_THE_HIGHLORD: {
    id: 151644,
    name: 'Soul of the Highlord',
    icon: 'inv_jewelry_ring_68',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  CHAIN_OF_THRAYN: {
    id: 137086,
    name: 'Chain of Thrayn',
    icon: 'inv_belt_leather_firelandsdruid_d_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  UTHERS_GUARD: {
    id: 137105,
    name: 'Uther\'s Guard',
    icon: 'inv_bracer_17',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Holy Paladin
  OBSIDIAN_STONE_SPAULDERS: {
    id: 137076,
    name: 'Obsidian Stone Spaulders',
    icon: 'inv_shoulder_plate_pvppaladin_o_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ILTERENDI_CROWN_JEWEL_OF_SILVERMOON: {
    id: 137046,
    name: 'Ilterendi, Crown Jewel of Silvermoon',
    icon: 'inv_jewelry_ring_firelandsraid_03a',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MARAADS_DYING_BREATH: {
    id: 144273,
    name: 'Maraad\'s Dying Breath',
    icon: 'item_icecrowncape',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  TYRS_HAND_OF_FAITH: {
    id: 137059,
    name: 'Tyr\'s Hand of Faith',
    icon: 'inv_glove_plate_panda_b_01blue',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_TOPLESS_TOWER: {
    id: 151782,
    name: 'The Topless Tower',
    icon: 'inv_helm_plate_raidpaladin_n_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  DRAPE_OF_SHAME: {
    id: 142170,
    name: 'Drape of Shame',
    icon: 'inv_cape_legionendgame_c_03',
    quality: ITEM_QUALITIES.EPIC,
  },
  // Ret Paladin
  WHISPER_OF_THE_NATHREZIM: {
    id: 137020,
    name: 'Whisper of the Nathrezim',
    icon: 'inv_cape_pandaria_d_04',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ASHES_TO_DUST: {
    id: 144358,
    name: 'Ashes to Dust',
    icon: 'inv_plate_firelands_d_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  LIADRINS_FURY_UNLEASHED: {
    id: 137048,
    name: 'Liadrin\'s Fury Unleashed',
    icon: 'inv_jewelry_ring_61',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  AEGISJALMUR_THE_ARMGUARDS_OF_AWE: {
    id: 140846,
    name: 'Aegisjalmur, the Armguards of Awe',
    icon: 'inv_bracer_plate_raidpaladin_m_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  JUSTICE_GAZE: {
    id: 137065,
    name: 'Justice Gaze',
    icon: 'inv_helmet_134',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SCARLET_INQUISITORS_EXPURGATION: {
    id: 151813,
    name: 'Scarlet Inquisitor\'s Expurgation',
    icon: 'inv_chest_plate_raidpaladin_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Protection Paladin
  HEATHCLIFFS_IMMORTALITY: {
    id: 137047,
    name: 'Heathcliff\'s Immortality',
    icon: 'inv_jewelry_ring_72',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  TYELCA_FERREN_MARCUSS_STATURE: {
    id: 137070,
    name: 'Tyelca, Ferren Marcus\'s Stature',
    icon: 'inv_pants_plate_raidwarrior_n_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  BREASTPLATE_OF_THE_GOLDEN_VALKYR: {
    id: 137017,
    name: 'Breastplate of the Golden Val\'kyr',
    icon: 'inv_chest_plate_panda_b_01gold',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SARUANS_RESOLVE: {
    id: 144275,
    name: 'Saruan\'s Resolve',
    icon: 'inv_plate_draenorcrafted_d_01helm',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  PILLARS_OF_INMOST_LIGHT: {
    id: 151812,
    name: 'Pillars of Inmost Light',
    icon: 'inv_shoulder_126',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Shared legenadries
  KILJAEDENS_BURNING_WISH: {
    id: 144259,
    name: 'Kil\'jaeden\'s Burning Wish',
    icon: 'sha_spell_fire_bluepyroblast_nightmare',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ROOTS_OF_SHALADRASSIL: {
    id: 132466,
    name: 'Roots of Shaladrassil',
    icon: 'inv_robe_pants_pvpwarlock_c_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Shared Shaman
  UNCERTAIN_REMINDER: {
    id: 143732,
    name: 'Uncertain Reminder',
    icon: 'inv_helm_mail_korkronshaman_d_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SOUL_OF_THE_FARSEER: {
    id: 151647,
    name: 'Soul of the Farseer',
    icon: 'inv_70_quest_ring2b',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  EYE_OF_THE_TWISTING_NETHER: {
    id: 137050,
    name: 'Eye of the Twisting Nether',
    icon: 'inv_jewelry_ring_ahnqiraj_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SMOLDERING_HEART: {
    id: 151819,
    name: 'Smoldering Heart',
    icon: 'inv_gauntlets_85',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Elemental Shaman
  THE_DECEIVERS_BLOOD_PACT: {
    id: 137035,
    name: 'The Deceiver\'s Blood Pact',
    icon: 'inv_boots_chain_07',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ECHOES_OF_THE_GREAT_SUNDERING: {
    id: 137074,
    name: 'Echoes of the Great Sundering',
    icon: 'inv_shoulder_plate_raidwarrior_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  PRISTINE_PROTO_SCALE_GIRDLE: {
    id: 137083,
    name: 'Pristine Proto-Scale Girdle',
    icon: 'inv_belt_mail_panda_b_01white',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ALAKIRS_ACRIMONY: {
    id: 137102,
    name: 'Al\'Akir\'s Acrimony',
    icon: 'inv_bracer_plate_pvpdeathknight_e_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // ENHANCEMENT SHAMAN LEGENDARIES
  AKAINUS_ABSOLUTE_JUSTICE: {
	  id: 137084,
	  name: 'Akainu\'s Absolute Justice',
	  icon: 'inv_bracer_mail_pvphunter_c_02',
	  quality: ITEM_QUALITIES.LEGENDARY,
  },
  EMALONS_CHARGED_CORE: {
    id: 137616,
    name: 'Emalon\'s Charged Core',
    icon: 'inv_chest_mail_dungeonmail_c_04',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  STORM_TEMPESTS: {
    id: 137103,
    name: 'Storm Tempests',
    icon: 'inv_belt_plate_pvpdeathknight_e_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SPIRITUAL_JOURNEY: {
    id: 138117,
    name: 'Spiritual Journey',
    icon: 'inv_boot_mail_raidhunter_m_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Resto Shaman
  FOCUSER_OF_JONAT: {
    id: 137051,
    name: 'Focuser of Jonat, the Elder',
    icon: 'inv_jewelry_ring_96',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  INTACT_NAZJATAR_MOLTING: {
    id: 137085,
    name: 'Intact Nazjatar Molting',
    icon: 'inv_leather_raiddruid_m_01belt',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ELEMENTAL_REBALANCERS: {
    id: 137036,
    name: 'Elemental Rebalancers',
    icon: 'inv_boots_mail_raidshaman_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  PRAETORIANS_TIDECALLERS: {
    id: 137058,
    name: 'Praetorian\'s Tidecallers',
    icon: 'inv_gauntlets_plate_raidpaladin_i_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },  
  NOBUNDOS_REDEMPTION: {
    id: 137104,
    name: 'Nobundo\'s Redemption',
    icon: 'inv_bracer_leather_cataclysm_b_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  FIRE_IN_THE_DEEP: {
    id: 151785,
    name: 'Fire in the Deep',
    icon: 'inv_chest_mail_raidshaman_m_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Shared Priest
  SOUL_OF_THE_HIGH_PRIEST: {
    id: 151646,
    name: 'Soul of the High Priest',
    icon: 'inv_jewelry_ring_67',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Discipline Priest
  CORD_OF_MAIEV_PRIESTESS_OF_THE_MOON: {
    id: 133800,
    name: 'Cord of Maiev, Priestess of the Moon',
    icon: 'inv_belt_leather_panda_b_02_crimson',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ESTEL_DEJAHNAS_INSPIRATION: {
    id: 132861,
    name: 'Estel, Dejahna\'s Inspiration',
    icon: 'inv_chest_cloth_43',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  NERO_BAND_OF_PROMISES: {
    id: 137276,
    name: 'N\'ero, Band of Promises',
    icon: 'inv_jewelry_ring_54',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SKJOLDR_SANCTUARY_OF_IVAGONT: {
    id: 132436,
    name: 'Skjoldr, Sanctuary of Ivagont',
    icon: 'inv_bracer_56',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  XALAN_THE_FEAREDS_CLENCH: {
    id: 132461,
    name: 'Xalan the Feared\'s Clench',
    icon: 'inv_gauntlets_14',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  KAM_XIRAFF: {
    id: 144244,
    name: 'Kam Xi\'raff',
    icon: 'inv_helmet_robe_raidpriest_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  INNER_HALLATION: {
    id: 151786,
    name: 'Inner Hallation',
    icon: 'inv_shoulder_robe_raidpriest_k_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Holy Priest
  XANSHI_CLOAK: { // when XANSHI_SHROUD_OF_ARCHBISHOP_BENEDICTUS is just too long :^)
    id: 137109,
    name: 'X\'anshi, Shroud of Archbishop Benedictus',
    icon: 'inv_misc_cape_20',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MUZES_UNWAVERING_WILL: {
    id: 132450,
    name: 'Muze\'s Unwavering Will',
    icon: 'inv_bracer_cloth_panda_b_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  PHYRIXS_EMBRACE: {
    id: 132449,
    name: 'Phyrix\'s Embrace',
    icon: 'inv_jewelry_ring_94',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ENTRANCING_TROUSERS_OF_ANJUNA: {
    id: 132447,
    name: 'Entrancing Trousers of An\'juna',
    icon: 'inv_pants_robe_raidwarlock_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ALMAIESH_THE_CORD_OF_HOPE: {
    id: 132445,
    name: 'Al\'maiesh, the Cord of Hope',
    icon: 'inv_belt_51',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  RAMMALS_ULTERIOR_MOTIVE: {
    id: 144247,
    name: 'Rammal\'s Ulterior Motive',
    icon: 'inv_cloth_draenorcrafted_d_01gloves_horde',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_ALABASTER_LADY: {
    id: 151787,
    name: 'The Alabaster Lady',
    icon: 'inv_helmet_136',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Shadow Priest
  ANUNDS_SEARED_SHACKLES: {
    id: 132409,
    name: 'Anund\'s Seared Shackles',
    icon: 'inv_bracer_leather_firelandsdruid_d_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ZENKARAM_IRIDIS_ANADEM: {
    id: 133971,
    name: 'Zenk\'aram, Iridi\'s Anadem',
    icon: 'inv_helm_robe_raidwarlock_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_TWINS_PAINFUL_TOUCH: {
    id: 133973,
    name: 'The Twins\' Painful Touch',
    icon: 'inv_ringwod_d4_2',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MANGAZAS_MADNESS: {
    id: 132864,
    name: 'Mangaza\'s Madness',
    icon: 'inv_belt_92v4',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MOTHER_SHAHRAZS_SEDUCTION: {
    id: 132437,
    name: 'Mother Shahraz\'s Seduction',
    icon: 'inv_shoulder_53',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ZEKS_EXTERMINATUS: {
    id: 144438,
    name: 'Zeks Exterminatus',
    icon: 'inv_cape_pandariapvp_d_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  HEART_OF_THE_VOID: {
    id: 151814,
    name: 'Heart of the Void',
    icon: 'inv_chest_cloth_raidpriestmythic_o_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Shared Mage
  SHARD_OF_THE_EXODAR: {
	  id: 132410,
	  name: 'Shard of the Exodar',
	  icon: 'inv_6_2raid_ring_2a',
	  quality: ITEM_QUALITIES.LEGENDARY,
  },
  BELOVIRS_FINAL_STAND: {
    id: 133977,
    name: 'Belo\'vir\'s Final Stand',
    icon: 'inv_chest_cloth_80',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SOUL_OF_THE_ARCHMAGE: {
    id: 151642,
    name: 'Soul of the Archmage',
    icon: 'inv_70_raid_ring2d',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Arcane Mage
  RHONINS_ASSAULTING_ARMWRAPS: {
    id: 132413,
    name: 'Rhonin\'s Assaulting Armwraps',
    icon: 'inv_bracer_cloth_pvpmage_c_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  CORD_OF_INFINITY: {
    id: 132442,
    name: 'Cord of Infinity',
    icon: 'inv_belt_44c',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MYSTIC_KILT_OF_THE_RUNE_MASTER: {
    id: 132451,
    name: 'Mystic Kilt of the Rune Master',
    icon: 'inv_kilt_cloth_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  GRAVITY_SPIRAL: {
    id: 144274,
    name: 'Gravity Spiral',
    icon: 'inv_helm_cloth_witchhat_b_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MANTLE_OF_THE_FIRST_KIRIN_TOR: {
    id: 151808,
    name: 'Mantle of the First Kirin Tor',
    icon: 'inv_shoulder_97',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Fire Mage
  KORALONS_BURNING_TOUCH: {
    id: 132454,
    name: 'Koralon\'s Burning Touch',
    icon: 'inv_belt_cloth_pvppriest_f_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  DARCKLIS_DRAGONFIRE_DIADEM: {
    id: 132863,
    name: 'Darckli\'s Dragonfire Diadem',
    icon: 'spell_fire_fire',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MARQUEE_BINDINGS_OF_THE_SUN_KING: {
    id: 132406,
    name: 'Marquee Bindings of the Sun King',
    icon: 'inv_bracer_robe_raidwarlock-j-01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  PYROTEX_IGNITION_CLOTH: {
    id: 144355,
    name: 'Pyrotex Ignition Cloth',
    icon: 'inv_gauntlets_16',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  CONTAINED_INFERNAL_CORE: {
    id: 151809,
    name: 'Contained Infernal Core',
    icon: 'inv_shoulder_robe_raidpriest_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  
  // Frost Mage
  LADY_VASHJS_GRASP: {
    id: 132411,
    name: 'Lady Vashj\'s Grasp',
    icon: 'inv_cloth_raidpriest_q_01_glove',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MAGTHERIDONS_BANISHED_BRACERS: {
    id: 138140,
    name: 'Magtheridon\'s Banished Bracers',
    icon: 'inv_bracer_64v1',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ZANNESU_JOURNEY: {
    id: 133970,
    name: 'Zann\'esu Journey',
    icon: 'inv_belt_71',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ICE_TIME: {
    id: 144260,
    name: 'Ice Time',
    icon: 'inv_shoulder_110',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SHATTERED_FRAGMENTS_OF_SINDRAGOSA: {
	  id: 151810,
	  name: 'Shattered Fragments of Sindragosa',
	  icon: 'inv_helmet_133',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Trinkets
  DARKMOON_DECK_PROMISES: {
    id: 128710,
    name: 'Darkmoon Deck: Promises',
    icon: '70_inscription_deck_promises',
    quality: ITEM_QUALITIES.EPIC,
  },
  AMALGAMS_SEVENTH_SPINE: {
    id: 136714,
    name: 'Amalgam\'s Seventh Spine',
    icon: 'spell_priest_mindspike',
    quality: ITEM_QUALITIES.EPIC,
  },
  // Set Bonuses (Generic)
  CHAIN_OF_SCORCHED_BONES: {
    id: 134529,
    name: 'Chain of Scorched Bones',
    icon: 'inv_7_0raid_necklace_13d',
    quality: ITEM_QUALITIES.EPIC,
  },
  RING_OF_LOOMING_MENACE: {
    id: 134533,
    name: 'Ring of Looming Menace',
    icon: 'inv_70_dungeon_ring8d',
    quality: ITEM_QUALITIES.EPIC,
  },

  // Shared Druid Legendaries
  SOUL_OF_THE_ARCHDRUID: {
    id: 151636,
    name: 'Soul of the Archdruid',
    icon: 'inv_70_raid_ring6a',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  EKOWRAITH_CREATOR_OF_WORLDS: {
    id: 137015,
    name: 'Ekowraith, Creator of Worlds',
    icon: 'inv_chest_leather_13',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Resto Druid legendaries:
  XONIS_CARESS: {
    id: 144242,
    name: 'X\'oni\'s Caress',
    icon: 'inv_glove_leather_raidrogue_m_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_DARK_TITANS_ADVICE: {
    id: 137078,
    name: 'The Dark Titan\'s Advice',
    icon: 'inv_belt_leather_raidrogue_l_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ESSENCE_OF_INFUSION: {
    id: 137026,
    name: 'Essence of Infusion',
    icon: 'inv_boots_leather_10v3',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  TEARSTONE_OF_ELUNE: {
    id: 137042,
    name: 'Tearstone of Elune',
    icon: 'inv_misc_pearlring2',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  CHAMELEON_SONG: {
    id: 151783,
    name: 'Chameleon Song',
    icon: 'inv_helmet_153',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  EDRAITH_BONDS_OF_AGLAYA: {
    id: 137095,
    name: 'Edraith, Bonds of Aglaya',
    icon: 'inv_bracer_57',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  AMANTHULS_WISDOM: {
    id: 137072,
    name: 'Aman\'Thul\'s Wisdom',
    icon: 'inv_shoulder_leather_raidmonk_n_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Balance Druid Legendaries
  IMPECCABLE_FEL_ESSENCE: {
    id: 137039,
    name: 'Impeccable Fel Essence',
    icon: 'inv_misc_ring_mop13',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ONETH_INTUITION: {
    id: 137092,
    name: 'Oneth\'s Intuition',
    icon: 'inv_bracer_40',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  LADY_AND_THE_CHILD: {
    id: 144295,
    name: 'Lady and the Child',
    icon: 'inv_shoulder_leather_draenorcrafted_d_01_alliance',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  EMERALD_DREAMCATCHER: {
    id: 137062,
    name: 'The Emerald Dreamcatcher',
    icon: 'inv_helmet_81',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  RADIANT_MOONLIGHT: {
    id: 151800,
    name: 'Radiant Moonlight',
    icon: 'inv_cape_felfire_raid_d_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  PROMISE_OF_ELUNE: {
    id: 137023,
    name: 'Promise of Elune, the Moon Goddess',
    icon: 'inv_boots_leather_raiddruid_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Feral Druid Legendaries
  CHATOYANT_SIGNET: {
    id: 137040,
    name: 'Chatoyant Signet',
    icon: 'inv_misc_ring_firelands_2',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  AILURO_POUNCERS: {
    id: 137024,
    name: 'Ailuro Pouncers',
    icon: 'inv_boots_leather_05red',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_WILDSHAPERS_CLUTCH: {
    id: 137094,
    name: 'The Wildshaper\'s Clutch',
    icon: 'inv_leather_raiddruid_o_01glove',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  FIERY_RED_MAIMERS: {
    id: 144354,
    name: 'Fiery Red Maimers',
    icon: 'inv_pants_leather_40v1',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  BEHEMOTH_HEADDRESS: {
    id: 151801,
    name: 'Behemoth Headdress',
    icon: 'inv_helmet_leather_draenorhonors2_c_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Shared Monk
  SOUL_OF_THE_GRANDMASTER: {
    id: 151643,
    name: 'Soul of the Grandmaster',
    icon: 'inv_jewelry_ring_119',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Mistweaver Monk
  EYE_OF_COLLIDUS_THE_WARPWATCHER: {
    id: 137045,
    name: 'Eye of Collidus the Warp-Watcher',
    icon: 'inv_jewelry_ring_45',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  PETRICHOR_LAGNIAPPE: {
    id: 137096,
    name: 'Petrichor Lagniappe',
    icon: 'inv_bracer_41',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  LEGGINGS_OF_THE_BLACK_FLAME: {
    id: 137068,
    name: 'Leggings of The Black Flame',
    icon: 'inv_pants_leather_27',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  UNISON_SPAULDERS: {
    id: 137073,
    name: 'Unison Spaulders',
    icon: 'inv_shoulder_leather_legionquest100_b_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  EITHAS_LUNAR_GLIDES: {
    id: 137028,
    name: 'Ei\'thas, Lunar Glides of Eramas',
    icon: 'inv_boots_mail_04black',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  OVYDS_WINTER_WRAP: {
    id: 138879,
    name: 'Ovyd\'s Winter Wrap',
    icon: 'inv_belt_leather_raiddruid_i_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SHELTER_OF_RIN: {
    id: 144340,
    name: 'Shelter of Rin',
    icon: 'inv_chest_plate27v2',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  DOORWAY_TO_NOWHERE: {
    id: 151784,
    name: 'Doorway to Nowhere',
    icon: 'inv_misc_cape_cataclysm_healer_b_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Brewmaster Monk Legendaries
  FIRESTONE_WALKERS: {
    id: 137027,
    name: 'Firestone Walkers',
    icon: 'inv_boots_leather_13v1',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SALSALABIMS_LOST_TUNIC: {
    id: 137016,
    name: 'Sal\'salabim\'s Lost Tunic',
    icon: 'inv_chest_leather_raidrogue_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  FUNDAMENTAL_OBSERVATION: {
    id: 137063,
    name: 'Fundamental Observation',
    icon: 'inv_helmet_cloth_pvpmage_c_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  GAI_PLINS_SOOTHING_SASH: {
    id: 137079,
    name: 'Gai Plin\'s Soothing Sash',
    icon: 'inv_belt_49',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  JEWEL_OF_THE_LOST_ABBEY: {
    id: 137044,
    name: 'Jewel of the Lost Abbey',
    icon: 'inv_jewelry_ring_138',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ANVIL_HARDENED_WRISTWRAPS: {
    id: 144277,
    name: 'Anvil-Hardened Wristwraps',
    icon: 'inv_bracer_leather_panda_b_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  STORMSTOUTS_LAST_GASP: {
    id: 151788,
    name: 'Stormstout\'s Last Gasp',
    icon: 'inv_shoulder_leather_pvpmonk_g_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  
  // Windwalker Monk Legendaries
  CENEDRIL_REFLECTOR_OF_HATRED: {
    id: 137019,
    name: 'Cenedril, Reflector of Hatred',
    icon: 'inv_cape_pandaria_b_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  DRINKING_HORN_COVER: {
    id: 137097,
    name: 'Drinking Horn Cover',
    icon: 'inv_bracer_26',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MARCH_OF_THE_LEGION: {
    id: 137220,
    name: 'March of the Legion',
    icon: 'inv_ringwod_d4_3',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  HIDDEN_MASTERS_FORBIDDEN_TOUCH: {
    id: 137057,
    name: 'Hidden Master\'s Forbidden Touch',
    icon: 'inv_gauntlet_leather_raidrogue_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  KATSUOS_ECLIPSE: {
    id: 137029,
    name: 'Katsuo\'s Eclipse',
    icon: 'inv_boots_cloth_33v4',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_EMPERORS_CAPACITOR: {
    id: 144239,
    name: 'The Emperor\'s Capacitor',
    icon: 'inv_chest_leather_raidrogue_l_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_WIND_BLOWS: {
    id: 151811,
    name: 'The Wind Blows',
    icon: 'inv_helmet_leather_raidmonk_l_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  
  // Shared Rogue Legendaries
  CINIDARIA_THE_SYMBIOTE: {
    id: 133976,
    name: 'Cinidaria, the Symbiote',
    icon: 'inv_leather_raiddruid_m_01belt',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SOUL_OF_THE_SHADOWBLADE: {
    id: 150936,
    name: 'Soul of the Shadowblade',
    icon: 'inv_jewelry_ring_56',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MANTLE_OF_THE_MASTER_ASSASSIN: {
    id: 144236,
    name: 'Mantle of the Master Assassin',
    icon: 'inv_shoulder_leather_raidrogue_k_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  INSIGNIA_OF_RAVENHOLDT: {
    id: 137049,
    name: 'Insignia of Ravenholdt',
    icon: 'inv_misc_epicring_a2',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  WILL_OF_VALEERA: {
    id: 137069,
    name: 'Will of Valeera',
    icon: 'inv_pants_cloth_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_DREADLORDS_DECEIT: {
    id: 137021,
    name: 'The Dreadlord\'s Deceit',
    icon: 'inv_cape_pandaria_d_03',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Assassination Rogue
  DUSKWALKERS_FOOTPADS: {
    id: 137030,
    name: 'Duskwalker\'s Footpads',
    icon: 'inv_boots_leather_8',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ZOLDYCK_FAMILY_TRAINING_SHACKLES: {
    id: 137098,
    name: 'Zoldyck Family Training Shackles',
    icon: 'inv_bracer_leather_raiddruid_i_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_EMPTY_CROWN: {
    id: 151815,
    name: 'The Empty Crown',
    icon: 'inv_crown_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Outlaw Rogue Legendaries
  THRAXIS_TRICKSY_TREADS: {
    id: 137031,
    name: 'Thraxi\'s Tricksy Treads',
    icon: 'inv_boots_leather_03a',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  GREENSKINS_WATERLOGGED_WRISTCUFFS: {
    id: 137099,
    name: 'Greenskin\'s Waterlogged Wristcuffs',
    icon: 'inv_bracer_leather_raidrogue_k_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SHIVARRAN_SYMMETRY: {
    id: 141321,
    name: 'Shivarran Symmetry',
    icon: 'inv_gauntlets_83',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_CURSE_OF_RESTLESSNESS: {
    id: 151817,
    name: 'The Curse of Restlessness',
    icon: 'inv_qiraj_draperegal',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Subtlety Rogue Legendaries
  SHADOW_SATYRS_WALK: {
    id: 137032,
    name: 'Shadow Satyr\'s Walk',
    icon: 'inv_boots_mail_dungeonmail_c_04',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  DENIAL_OF_THE_HALF_GIANTS: {
    id: 137100,
    name: 'Denial of the Half-Giants',
    icon: 'inv_bracer_leather_panda_b_02_crimson',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_FIRST_OF_THE_DEAD: {
    id: 151818,
    name: 'The First of the Dead',
    icon: 'inv_glove_cloth_raidwarlockmythic_q_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Warlock legendaries
  SACROLASHS_DARK_STRIKE: {
    id: 132378,
    name: 'Sacrolash\'s Dark Strike',
    icon: 'inv_jewelry_ring_66',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SOUL_OF_THE_NETHERLORD: {
    id: 151649,
    name: 'Soul of the Netherlord',
    icon: 'inv_70_quest_ring7c',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  POWER_CORD_OF_LETHTENDRIS: {
    id: 132457,
    name: 'Power Cord of Lethtendris',
    icon: 'inv_belt_30',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_MASTER_HARVESTER: {
    id: 151821,
    name: 'The Master Harvester',
    icon: 'inv_chest_cloth_raidmage_q_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  STRETENS_SLEEPLESS_SHACKLES: {
    id: 132381,
    name: 'Streten\'s Sleepless Shackles',
    icon: 'inv_bracer_cloth_raidwarlock_p_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  REAP_AND_SOW: {
    id: 144364,
    name: 'Reap and Sow',
    icon: 'inv_cape_pandaria_c_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  FERETORY_OF_SOULS: {
    id: 132456,
    name: 'Feretory of Souls',
    icon: 'inv_belt_cloth_raidwarlock_n_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ALYTHESSS_PYROGENICS: {
    id: 132460,
    name: 'Alythess\'s Pyrogenics',
    icon: 'inv_jewelry_ring_65',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SINDOREI_SPITE: {
    id: 132379,
    name: 'Sin\'dorei Spite',
    icon: 'inv_bracer_44',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  LESSONS_OF_SPACETIME: {
    id: 144369,
    name: 'Lessons of Space-Time',
    icon: 'inv_shoulder_robe_pvpwarlock_d_01',
  },
  ODR_SHAWL_OF_THE_YMIRJAR: {
    id: 132375,
    name: 'Odr, Shawl of the Ymirjar',
    icon: 'inv_misc_cape_cataclysm_tank_b_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MAGISTRIKE_RESTRAINTS: {
    id: 132407,
    name: 'Magistrike Restraints',
    icon: 'inv_bracer_31b',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // Demonology legendaries
  KAZZAKS_FINAL_CURSE: {
    id: 132374,
    name: 'Kazzak\'s Final Curse',
    icon: 'inv_belt_cloth_raidwarlock_i_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  WILFREDS_SIGIL_OF_SUPERIOR_SUMMONING: {
    id: 132369,
    name: 'Wilfred\'s Sigil of Superior Summoning',
    icon: 'inv_jewelry_ring_78',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  WAKENERS_LOYALTY: {
    id: 144385,
    name: 'Wakener\'s Loyalty',
    icon: 'inv_helm_cloth_raidwarlock_p_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  RECURRENT_RITUAL: {
    id: 132393,
    name: 'Recurrent Ritual',
    icon: 'inv_shoulder_cloth_raidwarlock_l_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // SHARED DEATH KNIGHT LEGENDARIES
  ACHERUS_DRAPES: {
    id: 132376,
    name: 'Acherus Drapes',
    icon: 'inv_cape_pandaria_d_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SOUL_OF_THE_DEATHLORD: {
    id: 151640,
    name: 'Soul of the Deathlord',
    icon: 'inv_70_pvp_ring2b',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  COLD_HEART: {
    id: 151796,
    name: 'Cold Heart',
    icon: 'inv_chest_plate_raiddeathknight_p_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // BLOOD DEATH KNIGHT LEGENDARIES
  SHACKLES_OF_BRYNDAOR: {
    id: 132365,
    name: 'Shackles of Bryndaor',
    icon: 'inv_bracer_plate_pvpdeathknight_o_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  RATTLEGORE_BONE_LEGPLATES: {
    id: 132453,
    name: 'Rattlegore Bone Legplates',
    icon: 'inv_pants_plate_raidwarrior_i_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SERVICE_OF_GOREFIEND: {
    id: 132367,
    name: 'Service of Gorefiend',
    icon: 'inv_belt_plate_deathknight_m_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  LANATHELS_LAMENT: {
    id: 133974,
    name: 'Lanathel\'s Lament',
    icon: 'inv_jewelry_ring_118',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SKULLFLOWERS_HAEMOSTASIS: {
    id: 144281,
    name: 'Skullflower\'s Haemostasis',
    icon: 'inv_shoulder_plate_raiddeathknight_l_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SOULFLAYERS_CORRUPTION: {
    id: 151795,
    name: 'Soulflayer\'s Corruption',
    icon: 'inv_plate_raidwarrior_o_01chest',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // FROST DEATH KNIGHT LEGENDARIES
  SEAL_OF_NECROFANTASIA: {
    id: 137223,
    name: 'Seal of Necrofantasia',
    icon: 'inv_jewelry_ring_86',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  KOLTIRAS_NEWFOUND_WILL: {
    id: 132366,
    name: 'Koltira\'s Newfound Will',
    icon: 'inv_belt_14',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  TORAVONS_WHITEOUT_BINDINGS: {
    id: 132458,
    name: 'Toravon\'s Whiteout Bindings',
    icon: 'inv_bracer_plate_raidpaladin_l_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  PERSEVERANCE_OF_THE_EBON_MARTYR: {
    id: 132459,
    name: 'Perseverance of the Ebon Martyr',
    icon: 'inv_helm_plate_raiddeathknight_k_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  CONSORTS_COLD_CORE: {
    id: 144293,
    name: 'Consort\'s Cold Core',
    icon: 'inv_pants_plate_03',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // UNHOLY DEATH KNIGHT LEGENDARIES
  TAKTHERITRIXS_SHOULDERPADS: {
    id: 137075,
    name: 'Tak\'theritrix\'s Shoulderpads',
    icon: 'inv_shoulder_plate_deathknight_m_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  DRAUGR_GIRDLE_OF_THE_EVERLASTING_KING: {
    id: 132441,
    name: 'Draugr, Girdle of the Everlasting King',
    icon: 'inv_belt_plate_raiddeathknight_k_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  UVANIMOR_THE_UNBEAUTIFUL: {
    id: 137037,
    name: 'Uvanimor, the Unbeautiful',
    icon: 'inv_jewelry_ring_121',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_INSTRUCTORS_FOURTH_LESSON: {
    id: 132448,
    name: 'The Instructor\'s Fourth Lesson',
    icon: 'inv_bracer_26b',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  DEATH_MARCH: {
    id: 144280,
    name: 'Death March',
    icon: 'inv_helm_plate_pvpdeathknight_c_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  // T20 Trinkets
  ARCHIVE_OF_FAITH: {
    id: 147006,
    name: 'Archive of Faith',
    icon: 'inv__wod_arakoa4',
    quality: ITEM_QUALITIES.EPIC,
  },
  BARBARIC_MINDSLAVER: {
    id: 147003,
    name: 'Barbaric Mindslaver',
    icon: 'spell_priest_psyfiend',
    quality: ITEM_QUALITIES.EPIC,
  },
  DECEIVERS_GRAND_DESIGN: {
    id: 147007,
    name: 'The Deceiver\'s Grand Design',
    icon: 'inv_offhand_1h_pvpcataclysms3_c_01',
    quality: ITEM_QUALITIES.EPIC,
  },
  SEA_STAR_OF_THE_DEPTHMOTHER: {
    id: 147004,
    name: 'Sea Star of the Depthmother',
    icon: 'inv_jewelcrafting_starofelune_02',
    quality: ITEM_QUALITIES.EPIC,
  },
  // DPS Trinkets
  TARNISHED_SENTINEL_MEDALLION: {
    id: 147017,
    name: 'Tarnished Sentinel Medallion',
    icon: 'inv_jewelcrafting_purpleowl.jpg',
    quality: ITEM_QUALITIES.EPIC,
  },
  SPECTER_OF_BETRAYAL: {
    id: 151190,
    name: 'Specter of Betrayal',
    icon: 'spell_warlock_soulburn',
    quality: ITEM_QUALITIES.EPIC,
  },
  VIAL_OF_CEASELESS_TOXINS: {
    id: 147011,
    name: 'Vial of Ceaseless Toxins',
    icon: 'inv_potionc_5',
    quality: ITEM_QUALITIES.EPIC,
  },
  ENGINE_OF_ERADICATION: {
    id: 147015,
    name: 'Engine of Eradication',
    icon: 'inv_relics_warpring',
    quality: ITEM_QUALITIES.EPIC,
  },
  SPECTRAL_THURIBLE: {
    id: 147018,
    name: 'Spectral Thurible',
    icon: 'inv_6_2raid_trinket_1d',
    quality: ITEM_QUALITIES.EPIC,
  },
  TERROR_FROM_BELOW: {
    id: 147016,
    name: 'Terror From Below',
    icon: 'trade_archaeology_sharkjaws',
    quality: ITEM_QUALITIES.EPIC,
  },
  TOME_OF_UNRAVELING_SANITY: {
    id: 147019,
    name: 'Tome of Unraveling Sanity',
    icon: 'inv_archaeology_70_demon_flayedskinchronicle',
    quality: ITEM_QUALITIES.EPIC,
  },
  CHALICE_OF_MOONLIGHT: {
    id: 147005,
    name: 'Chalice of Moonlight',
    icon: 'inv_offhand_pvealliance_d_01',
    quality: ITEM_QUALITIES.EPIC,
  },
  CHARM_OF_THE_RISING_TIDE: {
    id: 147002,
    name: 'Charm of the Rising Tide',
    icon: 'inv_7_0raid_trinket_04a',
    quality: ITEM_QUALITIES.EPIC,
  },
  INFERNAL_CINDERS: {
    id: 147009,
    name: 'Infernal Cinders',
    icon: 'spell_fire_burnoutgreen',
    quality: ITEM_QUALITIES.EPIC,
  },
  UMBRAL_MOONGLAIVES: {
    id: 147012,
    name: 'Umbral Moonglaives',
    icon: 'ability_upgrademoonglaive',
    quality: ITEM_QUALITIES.EPIC,
  },
  CRADLE_OF_ANGUISH: {
    id: 147010,
    name: 'Crade of Anguish',
    icon: 'inv_wand_36',
    quality: ITEM_QUALITIES.EPIC,
  },
  // Guardian legendaries
  ELIZES_EVERLASTING_ENCASEMENT: {
    id: 137067,
    name: 'Elize\'s Everlasting Encasement',
    icon: 'inv_jewelcrafting_purpleowl',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  DUAL_DETERMINATION: {
    id: 137041,
    name: 'Dual Determination',
    icon: 'inv_6_2raid_ring_4b',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  FURY_OF_NATURE: {
    id: 151802,
    name: 'Fury of Nature',
    icon: 'inv_cape_draenorquest90_b_03_mail',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SKYSECS_HOLD: {
    id: 137025,
    name: 'Skysec\'s Hold',
    icon: 'inv_boots_mail_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  OAKHEARTS_PUNY_QUODS: {
    id: 144432,
    name: 'Oakheart\'s Puny Quods',
    icon: 'inv_helm_leather_raiddruid_m_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  LUFFA_WRAPPINGS: {
    id: 137056,
    name: 'Luffa Wrappings',
    icon: 'inv_bracer_cloth_raidpriest_o_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Shared Demon Hunter legendaries
  SOUL_OF_THE_SLAYER: {
    id: 151639,
    name: 'Soul of the Slayer',
    icon: 'inv_70_dungeon_ring6a',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Vengeance Demon Hunter legendaries
  KIREL_NARAK: {
    id: 138949,
    name: 'Kirel Narak',
    icon: 'inv_boots_leather_dungeonleather_c_06',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  OBLIVIONS_EMBRACE: {
    id: 151799,
    name: 'Oblivion\'s Embrace',
    icon: 'inv_leather_raiddruid_m_01pant',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  FRAGMENT_OF_THE_BETRAYERS_PRISON: {
    id: 138854,
    name: 'Fragment of the Betrayer\'s Prison',
    icon: 'inv_jewelry_ring_134',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_DEFILERS_LOST_VAMBRACES: {
    id: 137091,
    name: 'The Defiler\'s Lost Vambraces',
    icon: 'inv_bracer_plate_pvpdeathknight_c_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  RUNEMASTERS_PAULDRONS: {
    id: 137071,
    name: 'Runemaster\'s Pauldrons',
    icon: 'inv_shoulder_105',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  CLOAK_OF_FEL_FLAMES: {
    id: 137066,
    name: 'Cloak of Fel Flames',
    icon: 'inv_misc_cape_09',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SPIRIT_OF_THE_DARKNESS_FLAME: {
    id: 144292,
    name: 'Spirit of the Darkness Flame',
    icon: 'inv_glove_leather_legionendgame_c_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Havoc Demon Hunter Legendaries
  MOARG_BIONIC_STABILIZERS: {
    id: 137090,
    name: 'Mo\'arg Bionic Stabilizers',
    icon: 'inv_plate_raiddeathknightmythic_o_01bracer',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  RADDONS_CASCADING_EYES: {
    id: 137061,
    name: 'Raddon\'s Cascading Eyes',
    icon: 'inv_misc_bandana_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ACHOR_THE_ETERNAL_HUNGER: {
    id: 137014,
    name: 'Achor, the Eternal Hunger',
    icon: 'inv_chest_mail_raidhuntermythic_p_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  LORAMUS_THALIPEDES_SACRIFICE: {
    id: 137022,
    name: 'Loramus Thalipedes\' Sacrifice',
    icon: 'inv_boot_leather_raiddruid_k_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ANGER_OF_THE_HALF_GIANTS: {
    id: 137038,
    name: 'Anger of the Half-Giants',
    icon: 'inv_60pvp_ring1a',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  DELUSIONS_OF_GRANDEUR: {
    id: 144279,
    name: 'Delusions of Grandeur',
    icon: 'inv_shoulder_51',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  CHAOS_THEORY: {
    id: 151798,
    name: 'Chaos Theory',
    icon: 'inv_cape_draenorraid_d_01plate_dk',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Hunter Shared Legendaries
  THE_SHADOW_HUNTERS_VOODOO_MASK: {
    id: 137064,
    name: 'The Shadow Hunter\'s Voodoo Mask',
    icon: 'inv_helmet_116',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  SOUL_OF_THE_HUNTMASTER: {
    id: 151641,
    name: 'Soul of the Huntmaster',
    icon: 'inv_70_quest_ring8a',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  CALL_OF_THE_WILD: {
    id: 137101,
    name: 'Call of the Wild',
    icon: 'inv_bracer_36b',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Beast Master Hunter Legendaries
  ROAR_OF_THE_SEVEN_LIONS: {
    id: 137080,
    name: 'Roar of the Seven Lions',
    icon: 'inv_belt_plate_pvpdeathknight_c_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  QAPLA_EREDUN_WAR_ORDER: {
    id: 137227,
    name: 'Qa\'pla, Eredun War Order',
    icon: 'inv_boot_mail_raidhunter_n_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_APEX_PREDATORS_CLAW: {
    id: 137382,
    name: 'The Apex Predator\'s Claw',
    icon: 'inv_jewelry_ring_100',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_MANTLE_OF_COMMAND: {
    id: 144326,
    name: 'The Mantle of Command',
    icon: 'inv_shoulder_mail_raidshaman_m_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  PARSELS_TONGUE: {
    id: 151805,
    name: 'Parsel\'s Tongue',
    icon: 'inv_chest_mail_dungeonmail_c_03',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  // Marksmanship Hunter Legendaries
  MAGNETIZED_BLASTING_CAP_LAUNCHER: {
    id: 141353,
    name: 'Magnetized Blasting Cap Launcher',
    icon: 'inv_bracer_mail_raidhunter_j_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ULLRS_FEATHER_SNOWSHOES: {
    id: 137033,
    name: 'Ullr\'s Feather Snowshoes',
    icon: 'inv_boots_mail_08',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  ZEVRIMS_HUNGER: {
    id: 137055,
    name: 'Zevrim\'s Hunger',
    icon: 'inv_jewelry_ring_36',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  WAR_BELT_OF_THE_SENTINEL_ARMY: {
    id: 137081,
    name: 'War Belt of the Sentinel Army',
    icon: 'inv_belt_66green',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  MKII_GYROSCOPIC_STABILIZER: {
    id: 144303,
    name: 'MKII Gyroscopic Stabilizer',
    icon: 'inv_glove_mail_raidshamanmythic_o_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  CELERITY_OF_THE_WINDRUNNERS: {
    id: 151803,
    name: 'Celerity of the Windrunners',
    icon: 'inv_cape_430dungeon_c_04',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  
  // Survival Hunter Legendaries
  NESINGWARYS_TRAPPING_TREADS: {
    id: 137034,
    name: 'Nesingwary\'s Trapping Treads',
    icon: 'inv_boots_mail_panda_b_02',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  FRIZZOS_FINGERTRAP: {
    id: 137043,
    name: 'Frizzo\'s Fingertrap',
    icon: 'inv_archaeology_ogres_sorcerer_king_toe_ring',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  HELBRINE_ROPE_OF_THE_MIST_MARAUDER: {
    id: 137082,
    name: 'Helbrine, Rope of the Mist Marauder',
    icon: 'inv_belt_mail_draenordungeon_c_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  BUTCHERS_BONE_APRON: {
    id: 144361,
    name: 'Butcher\'s Bone Apron',
    icon: 'inv_chest_chain_15',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  UNSEEN_PREDATORS_CLOAK: {
    id: 151807,
    name: 'Unseen Predator\'s Cloak',
    icon: 'inv_cape_leather_raiddemonhunter_r_01_long',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

  //Crafted Legendaries
  CELUMBRA_THE_NIGHTS_DICHOTOMY: {
    id: 146666,
    name: 'Celumbra, the Night\'s Dichotomy',
    icon: 'inv_cloth_raidmage_p_01shoulder',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  RETHUS_INCESSANT_COURAGE: {
    id: 146667,
    name: 'Rethu\'s Incessant Courage',
    icon: 'inv_plate_draenorcrafted_d_01buckle',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  VIGILANCE_PERCH: {
    id: 146668,
    name: 'Vigilance Perch',
    icon: 'inv_glove_mail_vrykuldragonrider_b_01',
    quality: ITEM_QUALITIES.LEGENDARY,
  },
  THE_SENTINTELS_ETERNAL_REFUGE: {
    id: 146669,
    name: 'The Sentinel\'s Eternal Refuge',
    icon: 'inv_leather_raiddemonhuntermythic_q_02boots',
    quality: ITEM_QUALITIES.LEGENDARY,
  },

};

export default indexById(ITEMS);
