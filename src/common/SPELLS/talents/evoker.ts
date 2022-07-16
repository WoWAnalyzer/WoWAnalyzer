import { SpellList } from '../Spell';

const talents: SpellList = {
  //region Shared Evoker Tree
  LANDSLIDE: {
    id: 358385,
    name: 'Landslide',
    icon: 'ability_earthen_pillar',
  },
  OBSIDIAN_SCALES: {
    id: 363916,
    name: 'Obsidian Scales',
    icon: 'inv_artifact_dragonscales',
  },
  EXPUNGE: {
    id: 365585,
    name: 'Expunge',
    icon: 'ability_evoker_fontofmagic_green',
  },
  NATURAL_CONVERGENCE: {
    id: 369913,
    name: 'Natural Convergence',
    icon: 'spell_frost_frostblast',
  },
  PERMEATING_CHILL_TALENT: {
    id: 370897,
    name: 'Permeating Chill',
    icon: 'spell_frost_coldhearted',
  },
  RESCUE: {
    id: 360995,
    name: 'Rescue',
    icon: 'ability_evoker_rescue',
  },
  FORGER_OF_MOUNTAINS: {
    id: 375528,
    name: 'Forger of Mountains',
    icon: 'ability_earthen_pillar',
  },
  INNATE_MAGIC: {
    // 2 POINTS
    id: 375520,
    name: 'Innate Magic',
    icon: 'ability_evoker_innatemagic4',
  },
  OBSIDIAN_BULWARK: {
    id: 375406,
    name: 'Obsidian Bulwark',
    icon: 'inv_shield_1h_revenantfire_d_01',
  },
  ENKINDLED: {
    //2 POINTS
    id: 375554,
    name: 'Enkindled',
    icon: 'ability_evoker_livingflame',
  },
  SCARLETT_ADAPTATION_TALENT: {
    id: 372470,
    name: 'Scarlett Adaptation',
    icon: 'inv_bijou_red',
  },
  QUELL: {
    id: 351338,
    name: 'Quell',
    icon: 'ability_evoker_quell',
  },
  RECALL: {
    id: 371806,
    name: 'Recall',
    icon: 'ability_evoker_recall',
  },
  CLOBBERING_SWEEP: {
    id: 375443,
    name: 'Clobbering Sweep',
    icon: 'ability_racial_tailswipe',
  },
  HEAVY_WINGBEATS: {
    id: 368838,
    name: 'Heavy Wingbeats',
    icon: 'ability_racial_wingbuffet',
  },
  TAILWIND: {
    id: 375556,
    name: 'Tailwind',
    icon: 'ability_skyreach_wind',
  },
  CAUTERIZING_FLAME: {
    id: 374251,
    name: 'Cauterizing Flame',
    icon: 'ability_evoker_fontofmagic_red',
  },
  ROAR_OF_EXHILARATION: {
    id: 375507,
    name: 'Roar of Exhilaration',
    icon: 'ability_hunter_mastertactitian',
  },
  SUFFUSED_WITH_POWER: {
    // 2 POINTS
    id: 376164,
    name: 'Suffused With Power',
    icon: 'spell_arcane_studentofmagic',
  },
  TIP_THE_SCALES: {
    id: 370553,
    name: 'Tip the Scales',
    icon: 'ability_evoker_tipthescales',
  },
  ATTUNED_TO_THE_DREAM: {
    // 2 POINTS
    id: 376930,
    name: 'Attuned to the Dream',
    icon: 'ability_rogue_imrovedrecuperate',
  },
  SLEEP_WALK: {
    id: 360806,
    name: 'Sleep Walk',
    icon: 'ability_xavius_dreamsimulacrum',
  },
  DRACONIC_LEGACY: {
    // 2 POINTS
    id: 376166,
    name: 'Draconic Legacy',
    icon: 'nv_helm_mail_dracthyrquest_b_02',
  },
  TEMPERED_SCALES: {
    // 2 POINTS
    id: 375544,
    name: 'Tempered Scales',
    icon: 'inv_misc_rubysanctum1',
  },
  EXTENDED_FLIGHT: {
    // 2 POINTS
    id: 375517,
    name: 'Extended Flight',
    icon: 'ability_evoker_hover',
  },
  BOUNTIFUL_BLOOM: {
    id: 370886,
    name: 'Bountiful Bloom',
    icon: 'ability_evoker_emeraldblossom',
  },
  BLAST_FURNACE: {
    // 2 POINTS
    id: 375510,
    name: 'Blast Furnace',
    icon: 'ability_evoker_firebreath',
  },
  EXUBERANCE: {
    id: 375542,
    name: 'Exuberance',
    icon: 'achievement_guildperk_mountup',
  },
  SOURCE_OF_MAGIC: {
    id: 369459,
    name: 'Source of Magic',
    icon: 'ability_evoker_blue_01',
  },
  ANCIENT_FLAME: {
    id: 369990,
    name: 'Ancient Flame',
    icon: 'inv_elemental_mote_fire01',
  },
  UNRAVEL: {
    id: 368432,
    name: 'Unravel',
    icon: 'ability_evoker_unravel',
  },
  PROTRACTED_TALONS: {
    id: 369909,
    name: 'Protracted Talons',
    icon: 'ability_evoker_azurestrike',
  },
  OPPRESSING_ROAR: {
    id: 372048,
    name: 'Oppressing Roar',
    icon: 'ability_evoker_oppressingroar',
  },
  FLY_WITH_ME: {
    id: 370665,
    name: 'Fly With Me',
    icon: 'ability_evoker_flywithme',
  },
  LUSH_GROWTH: {
    // 2 POINTS
    id: 375661,
    name: 'Lush Growth',
    icon: 'inv_staff_2h_bloodelf_c_01',
  },
  RENEWING_BLAZE: {
    id: 374348,
    name: 'Renewing Blaze',
    icon: 'ability_evoker_masterylifebinder_red',
  },
  LEAPING_FLAMES: {
    id: 369939,
    name: 'Leaping Flames',
    icon: 'spell_fire_flare',
  },
  OVERAWE: {
    id: 374346,
    name: 'Overawe',
    icon: 'ability_evoker_oppressingroar2',
  },
  AERIAL_MASTERY: {
    id: 365933,
    name: 'Aerial Mastery',
    icon: 'ability_evoker_aerialmastery',
  },
  TWIN_GUARDIAN: {
    id: 370888,
    name: 'Twin Guardian',
    icon: 'ability_skyreach_shielded',
  },
  FIRE_WITHIN: {
    id: 375577,
    name: 'Fire Within',
    icon: 'item_sparkofragnoros',
  },
  PYREXIA: {
    id: 375574,
    name: 'Pyrexia',
    icon: 'spell_fire_incinerate',
  },
  TERROR_OF_THE_SKIES: {
    id: 371032,
    name: 'Terror of the Skies',
    icon: 'ability_evoker_terroroftheskies',
  },
  TIME_SPIRAL: {
    id: 374968,
    name: 'Time Spiral',
    icon: 'ability_evoker_timespiral',
  },
  ZEPHYR: {
    id: 374227,
    name: 'Zephyr',
    icon: 'ability_evoker_hoverblack',
  },
  //endregion
  //region Preservation Tree
  REVERSION: {
    id: 366155,
    name: 'Reversion',
    icon: 'ability_evoker_reversion',
  },
  DREAM_BREATH: {
    id: 355936,
    name: 'Dream Breath',
    icon: 'ability_evoker_dreambreath',
  },
  ECHO: {
    id: 364343,
    name: 'Echo',
    icon: 'ability_evoker_echo',
  },
  TEMPORAL_COMPRESSION: {
    id: 362874,
    name: 'Temporal Compression',
    icon: 'ability_evoker_rewind2',
  },
  ESSENCE_BURST: {
    id: 369297,
    name: 'Essence Burst',
    icon: 'ability_evoker_essenceburst',
  },
  REWIND: {
    id: 363534,
    name: 'Rewind',
    icon: 'ability_evoker_rewind',
  },
  SPIRITBLOOM: {
    id: 367226,
    name: 'Spiritbloom',
    icon: 'ability_evoker_spiritbloom2',
  },
  LIFE_GIVERS_FLAME: {
    id: 371426,
    name: 'Life Givers Flame',
    icon: 'item_sparkofragnoros',
  },
  TIME_DILATION: {
    id: 357170,
    name: 'Time Dilation',
    icon: 'ability_evoker_timedilation',
  },
  EMERALD_COMMUNION: {
    id: 370960,
    name: 'Emerald Communion',
    icon: 'ability_evoker_green_01',
  },
  SPIRITUAL_CLARITY: {
    id: 376150,
    name: 'Spiritual Clarity',
    icon: 'ability_evoker_spiritbloom',
  },
  EMPATH: {
    id: 376138,
    name: 'Empath',
    icon: 'ability_evoker_powernexus2',
  },
  FLUTTERING_SEEDLINGS: {
    // 3 POINTS
    id: 359793,
    name: 'Fluttering Seedlings',
    icon: 'inv_herbalism_70_yserallineseed',
  },
  ESSENCE_STRIKE: {
    id: 377096,
    name: 'Essence Strike',
    icon: 'ability_evoker_essenceburst2',
  },
  GOLDEN_HOUR: {
    id: 378196,
    name: 'Golden Hour',
    icon: 'inv_belt_armor_waistoftime_d_01',
  },
  JUST_IN_TIME: {
    id: 376204,
    name: 'Just In Time',
    icon: 'inv_offhand_1h_artifactsilverhand_d_01',
  },
  DELAY_HARM: {
    id: 376207,
    name: 'Delay Harm',
    icon: 'ability_racial_magicalresistance',
  },
  TEMPORAL_ANOMALY: {
    id: 373861,
    name: 'Temporal Anomaly',
    icon: 'ability_evoker_temporalanomaly',
  },
  DREAMWALKER: {
    id: 377082,
    name: 'Dreamwalker',
    icon: 'ability_hunter_onewithnature',
  },
  FLOW_STATE: {
    id: 377086,
    name: 'Flow State',
    icon: 'trade_enchanting_greatermysteriousessence',
  },
  FIELD_OF_DREAMS: {
    id: 370062,
    name: 'Field of Dreams',
    icon: 'inv_misc_herb_chamlotus',
  },
  LIFEFORCE_MENDER: {
    // 3 POINTS
    id: 376179,
    name: 'Lifeforce Mender',
    icon: 'ability_evoker_dragonrage2_green',
  },
  TIME_LORD: {
    // 3 POINTS
    id: 372527,
    name: 'Time Lord',
    icon: 'ability_evoker_innatemagic4',
  },
  NOZDORMUS_TEACHINGS: {
    id: 376237,
    name: "Nozdormu's Teachings",
    icon: 'inv_misc_head_dragon_bronze',
  },
  TEMPORAL_DISRUPTION: {
    id: 376236,
    name: 'Temporal Disruption',
    icon: 'ability_evoker_bronze_01',
  },
  LIFEBIND: {
    id: 373270,
    name: 'Lifebind',
    icon: 'ability_evoker_hovergreen',
  },
  CALL_OF_YSERA: {
    id: 373834,
    name: 'Call of Ysera',
    icon: '4096390', // TODO: Update this when available
  },
  TIME_OF_NEED: {
    id: 368412,
    name: 'Time of Need',
    icon: 'ability_evoker_masterylifebinder_bronze',
  },
  SACRAL_EMPOWERMENT: {
    id: 377099,
    name: 'Sacral empowerment',
    icon: 'ability_evoker_essenceburststacks',
  },
  EXHILIRATING_BURST: {
    id: 377100,
    name: 'Exhilirating Burst',
    icon: 'ability_evoker_essenceburst3',
  },
  GROVE_TENDER: {
    id: 381921,
    name: 'Grove Tender',
    icon: 'classicon_evoker_preservation',
  },
  FONT_OF_MAGIC: {
    id: 375783,
    name: 'Font of Magic',
    icon: 'ability_evoker_fontofmagic',
  },
  TEMPORAL_ARTIFICER: {
    id: 381922,
    name: 'Temporal Artificer',
    icon: 'ability_evoker_rewind',
  },
  BORROWED_TIME: {
    id: 197762,
    name: 'Borrowed Time',
    icon: 'ability_priest_angelicbulwark',
  },
  ENERGY_LOOP: {
    id: 372233,
    name: 'Energy Loop',
    icon: 'inv_elemental_mote_mana',
  },
  TIME_KEEPER: {
    id: 371270,
    name: 'Time Keeper',
    icon: 'inv_offhand_1h_ulduarraid_d_01',
  },
  RENEWING_BREATH: {
    // 3 POINTS
    id: 371257,
    name: 'Renewing Breath',
    icon: 'ability_evoker_dreambreath',
  },
  GRACE_PERIOD: {
    // 3 POINTS
    id: 376239,
    name: 'Grace Period',
    icon: 'spell_nature_astralrecal',
  },
  TIMELESS_MAGIC: {
    // 3 POINTS
    id: 376240,
    name: 'Timless Magic',
    icon: 'inv_artifact_xp05',
  },
  DREAM_FLIGHT: {
    id: 359816,
    name: 'Dream Flight',
    icon: 'ability_evoker_dreamflight',
  },
  STASIS: {
    id: 370537,
    name: 'Stasis',
    icon: 'ability_evoker_stasis',
  },
  CYCLE_OF_LIFE: {
    id: 371832,
    name: 'Cycle of Life',
    icon: 'spell_lifegivingseed',
  },
  //endregion
  //region Devastation Tree
  PYRE: {
    id: 357211,
    name: 'Pyre',
    icon: 'ability_evoker_pyre',
  },
  RUBY_ESSENCE_BURST: {
    id: 376872,
    name: 'Ruby Essence Burst',
    icon: 'ability_evoker_essenceburst4',
  },
  AZURE_ESSENCE_BURST: {
    id: 375721,
    name: 'Azure Essence Burst',
    icon: 'ability_evoker_essenceburst2',
  },
  VOLATILITY: {
    // 2 POINTS
    id: 369089,
    name: 'Volatility',
    icon: 'spell_fire_ragnaros_lavabolt',
  },
  ARCANE_INTENSITY: {
    // 2 POINTS
    id: 375618,
    name: 'Arcane Intensity',
    icon: 'ability_evoker_disintegrate',
  },
  LAY_WASTE: {
    // 2 POINTS
    id: 371034,
    name: 'Lay Waste',
    icon: 'ability_evoker_deepbreath',
  },
  DENSE_ENERGY: {
    id: 370962,
    name: 'Dense Energy',
    icon: 'ability_evoker_pyre',
  },
  ESSENCE_ATTUNEMENT: {
    id: 375722,
    name: 'Essence Attunement',
    icon: 'ability_evoker_essenceburststacks',
  },
  RUBY_AFFINITY: {
    // 2 POINTS
    id: 376889,
    name: 'Ruby Affinity',
    icon: 'inv_elemental_primal_fire',
  },
  DRAGONRAGE: {
    id: 375087,
    name: 'Dragonrage',
    icon: 'ability_evoker_dragonrage',
  },
  AZURE_AFFINITY: {
    // 2 POINTS
    id: 376890,
    name: 'Azure Affinity',
    icon: 'inv_misc_lesseressence',
  },
  ENGULFING_BLAZE: {
    id: 370837,
    name: 'Engulfing Blaze',
    icon: 'inv_inscription_pigment_ruby',
  },
  RUBY_EMBERS: {
    id: 365937,
    name: 'Ruby Embers',
    icon: 'inv_tradeskillitem_lessersorcerersfire',
  },
  IMMINENT_DESTRUCTION: {
    id: 370781,
    name: 'Imminent Destruction',
    icon: 'spell_burningbladeshaman_blazing_radiance',
  },
  ANIMOSITY: {
    id: 375797,
    name: 'Animosity',
    icon: 'spell_nature_shamanrage',
  },
  POWER_SWELL: {
    id: 370839,
    name: 'Power Swell',
    icon: 'ability_evoker_powerswell',
  },
  ETERNITY_SURGE: {
    id: 359073,
    name: 'Eternity Surge',
    icon: 'ability_evoker_eternitysurge',
  },
  FIRESTORM: {
    id: 368847,
    name: 'Firestorm',
    icon: 'ability_evoker_firestorm',
  },
  CASCADING_POWER: {
    id: 375796,
    name: 'Cascading Power',
    icon: 'ability_evoker_innatemagic2',
  },
  IMPOSING_PRESENCE: {
    id: 371016,
    name: 'Imposing Presence',
    icon: 'ability_evoker_quell',
  },
  POWER_NEXUS: {
    id: 369908,
    name: 'Power Nexus',
    icon: 'ability_evoker_powernexus',
  },
  CAUSALITY: {
    id: 375777,
    name: 'Causality',
    icon: 'spell_azerite_essence_16',
  },
  CONTINUUM: {
    id: 369375,
    name: 'Continuum',
    icon: 'ability_socererking_arcanewrath',
  },
  CHARGED_BLAST: {
    id: 370452,
    name: 'Charged Blast',
    icon: 'ability_evoker_chargedblast',
  },
  SNAPFIRE: {
    id: 370783,
    name: 'Snapfire',
    icon: 'spell_shaman_improvedfirenova',
  },
  FEED_THE_FLAMES: {
    id: 369846,
    name: 'Feed the Flames',
    icon: 'mace_1h_blacksmithing_d_04_icon',
  },
  HEAT_WAVE: {
    // 2 POINTS
    id: 375725,
    name: 'Heat Wave',
    icon: 'spell_fire_moltenblood',
  },
  HONED_AGGRESSION: {
    // 2 POINTS
    id: 371038,
    name: 'Honed Aggression',
    icon: 'spell_fire_blueimmolation',
  },
  ETERNITYS_SPAN: {
    id: 375757,
    name: "Eternity's Span",
    icon: 'spell_arcane_starfire',
  },
  EXPANSIVE_MAW: {
    id: 376156,
    name: 'Expansive Maw',
    icon: 'inv_misc_head_dragon_blue',
  },
  ARCANE_REVERBERATION: {
    id: 376159,
    name: 'Arcane Reverberation',
    icon: 'ability_monk_forcesphere',
  },
  BURNOUT: {
    // 2 POINTS
    id: 375801,
    name: 'Burnout',
    icon: 'spell_fire_soulburn',
  },
  RUIN: {
    id: 376888,
    name: 'Ruin',
    icon: 'ability_evoker_dragonrage2',
  },
  FOCUSING_IRIS: {
    // 2 POINTS
    id: 370843,
    name: 'Focusing Iris',
    icon: 'spell_mage_temporalshield',
  },
  EVERBURNING_FLAME: {
    id: 370819,
    name: 'Everburning Flame',
    icon: 'spell_fire_burnout',
  },
  TYRANNY: {
    // 2 POINTS
    id: 370845,
    name: 'Tyranny',
    icon: 'spell_shaman_shockinglava',
  },
  SCINTILLATION: {
    id: 370821,
    name: 'Scintillation',
    icon: 'spell_arcane_arcane03',
  },
  //endregion
};

export default talents;
