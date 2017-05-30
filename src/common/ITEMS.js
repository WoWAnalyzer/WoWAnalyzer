import indexById from './indexById';

const QUALITIES = {
  LEGENDARY: 'legendary',
  EPIC: 'epic',
};

const ITEMS = {
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
};

export default indexById(ITEMS);
