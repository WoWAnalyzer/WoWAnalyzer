import indexById from './indexById';

const QUALITIES = {
  LEGENDARY: 'legendary',
  EPIC: 'epic',
};

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
    quality: QUALITIES.LEGENDARY,
  },
  SEPHUZS_SECRET: {
    id: 132452,
    name: 'Sephuz\'s Secret',
    icon: 'inv_jewelry_ring_149',
    quality: QUALITIES.LEGENDARY,
  },
  VELENS_FUTURE_SIGHT: {
    id: 144258,
    name: 'Velen\'s Future Sight',
    icon: 'spell_holy_healingfocus',
    quality: QUALITIES.LEGENDARY,
  },
  GNAWED_THUMB_RING: {
    id: 134526,
    name: 'Gnawed Thumb Ring',
    icon: 'inv_70_dungeon_ring6a',
    quality: QUALITIES.EPIC,
  },

  OBSIDIAN_STONE_SPAULDERS: {
    id: 137076,
    name: 'Obsidian Stone Spaulders',
    icon: 'inv_shoulder_plate_pvppaladin_o_01',
    quality: QUALITIES.LEGENDARY,
  },
  ILTERENDI_CROWN_JEWEL_OF_SILVERMOON: {
    id: 137046,
    name: 'Ilterendi, Crown Jewel of Silvermoon',
    icon: 'inv_jewelry_ring_firelandsraid_03a',
    quality: QUALITIES.LEGENDARY,
  },
  SOUL_OF_THE_HIGHLORD: {
    id: 151644,
    name: 'Soul of the Highlord',
    icon: 'inv_jewelry_ring_68',
    quality: QUALITIES.LEGENDARY,
  },
  CHAIN_OF_THRAYN: {
    id: 137086,
    name: 'Chain of Thrayn',
    icon: 'inv_belt_leather_firelandsdruid_d_01',
    quality: QUALITIES.LEGENDARY,
  },
  MARAADS_DYING_BREATH: {
    id: 144273,
    name: 'Maraad\'s Dying Breath',
    icon: 'item_icecrowncape',
    quality: QUALITIES.LEGENDARY,
  },
  DRAPE_OF_SHAME: {
    id: 142170,
    name: 'Drape of Shame',
    icon: 'inv_cape_legionendgame_c_03',
    quality: QUALITIES.EPIC,
  },
  ROOTS_OF_SHALADRASSIL: {
    id: 132466,
    name: 'Roots of Shaladrassil',
    icon: 'inv_robe_pants_pvpwarlock_c_02',
    quality: QUALITIES.LEGENDARY,
  },
  PRAETORIANS_TIDECALLERS: {
    id: 137058,
    name: 'Praetorian\'s Tidecallers',
    icon: 'inv_gauntlets_plate_raidpaladin_i_01',
    quality: QUALITIES.LEGENDARY,
  },
  FOCUSER_OF_JONAT: {
    id: 137051,
    name: 'Focuser of Jonat, the Elder',
    icon: 'inv_jewelry_ring_96',
    quality: QUALITIES.LEGENDARY,
  },
  INTACT_NAZJATAR_MOLTING: {
    id: 137085,
    name: 'Intact Nazjatar Molting',
    icon: 'inv_leather_raiddruid_m_01belt',
    quality: QUALITIES.LEGENDARY,
  },
  NOBUNDOS_REDEMPTION: {
    id: 137104,
    name: 'Nobundo\'s Redemption',
    icon: 'inv_bracer_leather_cataclysm_b_01',
    quality: QUALITIES.LEGENDARY,
  },
  UNCERTAIN_REMINDER: {
    id: 143732,
    name: 'Uncertain Reminder',
    icon: 'inv_helm_mail_korkronshaman_d_01',
    quality: QUALITIES.LEGENDARY,
  },
  // PRIEST LEGENDARIES
  CORD_OF_MAIEV_PRIESTESS_OF_THE_MOON: {
    id: 133800,
    name: 'Cord of Maiev, Priestess of the Moon',
    icon: 'inv_belt_leather_panda_b_02_crimson',
    quality: QUALITIES.LEGENDARY,
  },
  SKJOLDR_SANCTUARY_OF_IVAGONT: {
    id: 132436,
    name: 'Skjoldr, Sanctuary of Ivagont',
    icon: 'inv_bracer_56',
    quality: QUALITIES.LEGENDARY,
  },
  XALAN_THE_FEAREDS_CLENCH: {
    id: 132461,
    name: 'Xalan the Feared\'s Clench',
    icon: 'inv_gauntlets_14',
    quality: QUALITIES.LEGENDARY,
  },
  NERO_BAND_OF_PROMISES: {
    id: 137276,
    name: 'N\'ero, Band of Promises',
    icon: 'inv_jewelry_ring_54',
    quality: QUALITIES.LEGENDARY,
  },
  SOUL_OF_THE_HIGH_PRIEST: {
    id: 151646,
    name: 'Soul of the High Priest',
    icon: 'inv_jewelry_ring_67',
    quality: QUALITIES.LEGENDARY,
  },
  // Trinkets
  DARKMOON_DECK_PROMISES: {
    id: 128710,
    name: 'Darkmoon Deck: Promises',
    icon: '70_inscription_deck_promises',
    quality: QUALITIES.EPIC,
  },
  AMALGAMS_SEVENTH_SPINE: {
    id: 136714,
    name: 'Amalgam\'s Seventh Spine',
    icon: 'spell_priest_mindspike',
    quality: QUALITIES.EPIC,
  },
  // Set Bonuses (Generic)
  CHAIN_OF_SCORCHED_BONES: {
    id: 134529,
    name: 'Chain of Scorched Bones',
    icon: 'inv_7_0raid_necklace_13d',
    quality: QUALITIES.EPIC,
  },
  RING_OF_LOOMING_MENACE: {
    id: 134533,
    name: 'Ring of Looming Menace',
    icon: 'inv_70_dungeon_ring8d',
    quality: QUALITIES.EPIC,
  },
  // Resto Druid legendaries:
  EKOWRAITH_CREATOR_OF_WORLDS: {
    id: 137015,
    name: 'Ekowraith, Creator of Worlds',
    icon: 'inv_chest_leather_13',
    quality: QUALITIES.LEGENDARY,
  },
  XONIS_CARESS: {
    id: 144242,
    name: 'X\'oni\'s Caress',
    icon: 'inv_glove_leather_raidrogue_m_01',
    quality: QUALITIES.LEGENDARY,
  },
  THE_DARK_TITANS_ADVICE: {
    id: 137078,
    name: 'The Dark Titan\'s Advice',
    icon: 'inv_belt_leather_raidrogue_l_01',
    quality: QUALITIES.LEGENDARY,
  },
  ESSENCE_OF_INFUSION: {
    id: 137026,
    name: 'Essence of Infusion',
    icon: 'inv_boots_leather_10v3',
    quality: QUALITIES.LEGENDARY,
  },
  TEARSTONE_OF_ELUNE: {
    id: 137042,
    name: 'Tearstone of Elune',
    icon: 'inv_misc_pearlring2',
    quality: QUALITIES.LEGENDARY,
  },
  CHAMELEON_SONG: {
    id: 151783,
    name: 'Chameleon Song',
    icon: 'inv_helmet_153',
    quality: QUALITIES.LEGENDARY,
  },
  SOUL_OF_THE_ARCHDRUID: {
    id: 151636,
    name: 'Soul of the Archdruid',
    icon: 'inv_70_raid_ring6a',
    quality: QUALITIES.LEGENDARY,
  },
  // Monk Legedaries
  EITHAS_LUNAR_GLIDES: {
    id: 137028,
    name: 'Ei\'thas, Lunar Glides of Eramas',
    icon: 'inv_boots_mail_04black',
    quality: QUALITIES.LEGENDARY,
  },
  DOORWAY_TO_NOWHERE: {
    id: 151784,
    name: 'Doorway to Nowhere',
    icon: 'inv_misc_cape_cataclysm_healer_b_01',
    quality: QUALITIES.LEGENDARY,
  },

  // T20 Trinkets
  ARCHIVE_OF_FAITH: {
    id: 147006,
    name: 'Archive of Faith',
    icon: 'inv__wod_arakoa4',
    quality: QUALITIES.EPIC,
  },
  BARBARIC_MINDSLAVER: {
    id: 147003,
    name: 'Barbaric Mindslaver',
    icon: 'spell_priest_psyfiend',
    quality: QUALITIES.EPIC,
  },
  DECEIVERS_GRAND_DESIGN: {
    id: 147007,
    name: 'The Deceiver\'s Grand Design',
    icon: 'inv_offhand_1h_pvpcataclysms3_c_01',
    quality: QUALITIES.EPIC,
  },
  SEA_STAR_OF_THE_DEPTHMOTHER: {
    id: 147004,
    name: 'Sea Star of the Depthmother',
    icon: 'inv_jewelcrafting_starofelune_02',
    quality: QUALITIES.EPIC,
  },
  // DPS Trinkets
  TARNISHED_SENTINEL_MEDALLION: {
    id: 147017,
    name: 'Tarnished Sentinel Medallion',
    icon: 'inv_jewelcrafting_purpleowl.jpg',
    quality: QUALITIES.EPIC,
  },
};

export default indexById(ITEMS);
