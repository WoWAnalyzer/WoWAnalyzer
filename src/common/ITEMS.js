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
  OBSIDIAN_STONE_SPAULDERS: {
    id: 137076,
    name: 'Obsidian Stone Spaulders',
    icon: 'inv_shoulder_plate_pvppaladin_o_01',
    quality: QUALITIES.LEGENDARY,
  },
  VELENS_FUTURE_SIGHT_BUFF: {
    id: 144258,
    name: 'Velen\'s Future Sight',
    icon: 'spell_holy_healingfocus',
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
};

export default indexById(ITEMS);
