/**
 * All Evoker abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';

const spells = {
  // Preservation Spells
  MASTERY_LIFEBINDER: {
    id: 363510,
    name: 'Mastery: Life-Binder',
    icon: 'ability_evoker_masterylifebinder',
  },
  NATURALIZE: {
    id: 360823,
    name: 'Naturalize',
    icon: 'ability_evoker_fontofmagic_green',
  },
  REVERSION_ECHO: {
    id: 367364,
    name: 'Reversion',
    icon: 'ability_evoker_reversion2',
  },
  GOLDEN_HOUR_HEAL: {
    id: 378213,
    name: 'Golden Hour',
    icon: 'inv_belt_armor_waistoftime_d_01',
  },
  DREAM_BREATH: {
    id: 355941,
    name: 'Dream Breath',
    icon: 'ability_evoker_dreambreath',
  },
  DREAM_BREATH_ECHO: {
    id: 376788,
    name: 'Dream Breath',
    icon: 'ability_evoker_dreambreath',
  },
  DREAM_BREATH_FONT: {
    id: 382614,
    name: 'Dream Breath',
    icon: 'ability_evoker_dreambreath',
  },
  TWIN_GUARDIAN_SHIELD: {
    id: 370889,
    name: 'Twin Guardian',
    icon: 'ability_skyreach_shielded',
  },
  TEMPORAL_ANOMALY_SHIELD: {
    id: 373862,
    name: 'Temporal Anomaly',
    icon: 'ability_evoker_temporalanomaly',
  },
  CALL_OF_YSERA_BUFF: {
    id: 373835,
    name: 'Call of Ysera',
    icon: 'inv_drakemountemerald',
  },
  SPIRITBLOOM: {
    id: 367230,
    name: 'Spiritbloom',
    icon: 'ability_evoker_spiritbloom2',
  },
  SPIRITBLOOM_FONT: {
    id: 382731,
    name: 'Spiritbloom',
    icon: 'ability_evoker_spiritbloom2',
  },
  SPIRITBLOOM_SPLIT: {
    id: 367231,
    name: 'Spiritbloom',
    icon: 'ability_evoker_spiritbloom2',
  },
  LIFE_GIVERS_FLAME_HEAL: {
    id: 371441,
    name: "Life Giver's Flame",
    icon: 'item_sparkofragnoros',
  },
  FLUTTERING_SEEDLINGS_HEAL: {
    id: 361361,
    name: 'Fluttering Seedlings',
    icon: 'inv_herbalism_70_yserallineseed',
  },
  CYCLE_OF_LIFE_BUFF: {
    id: 371877,
    name: 'Cycle of Life',
    icon: 'ability_monk_explodingjadeblossom',
  },
  CYCLE_OF_LIFE_HEAL: {
    id: 371879,
    name: 'Cycle of Life',
    icon: 'ability_monk_explodingjadeblossom',
  },
  CYCLE_OF_LIFE_SUMMON: {
    id: 371871,
    name: 'Cycle of Life',
    icon: 'ability_monk_explodingjadeblossom',
  },
  DREAM_FLIGHT_HEAL: {
    id: 363502,
    name: 'Dream Flight',
    icon: 'ability_evoker_dreamflight',
  },
  EMERALD_COMMUNION_ALLY: {
    id: 370984,
    name: 'Emerald Communion',
    icon: 'ability_evoker_green_01',
  },
  LIFEBIND_HEAL: {
    id: 373268,
    name: 'Lifebind',
    icon: 'ability_evoker_hoverred',
  },
  // Devastation Spells
  ETERNITY_SURGE: {
    id: 359073,
    name: 'Eternity Surge',
    icon: 'ability_evoker_eternitysurge',
  },
  ETERNITY_SURGE_DAM: {
    id: 359077,
    name: 'Eternity Surge',
    icon: 'ability_evoker_eternitysurge',
  },
  PYRE: {
    id: 357212,
    name: 'Pyre',
    icon: 'ability_evoker_pyre',
  },
  PYRE_DENSE_TALENT: {
    id: 357211,
    name: 'Pyre',
    icon: 'ability_evoker_pyre',
  },
  CHARGED_BLAST: {
    id: 370454,
    name: 'Charged Blast',
    icon: 'spell_arcane_arcanepotency',
  },
  ETERNITY_SURGE_FONT: {
    id: 382411,
    name: 'Eternity Surge',
    icon: 'ability_evoker_eternitysurge',
  },
  SHATTERING_STAR: {
    id: 370452,
    name: 'Shattering Star',
    icon: 'ability_evoker_chargedblast',
  },
  ESSENCE_BURST_DEV_BUFF: {
    id: 359618,
    name: 'Essence Burst',
    icon: 'ability_evoker_essenceburst',
  },
  // Buff during Dragonrage
  EMERALD_TRANCE_T31_2PC_BUFF: {
    id: 424155,
    name: 'Emerald Trance',
    icon: 'inv_legion_faction_dreamweavers',
  },
  // Buff after Dragonrage
  EMERALD_TRANCE_T31_4PC_BUFF: {
    id: 424402,
    name: 'Emerald Trance',
    icon: 'inv_legion_faction_dreamweavers',
  },
  // Shared
  BLESSING_OF_THE_BRONZE: {
    id: 364342,
    name: 'Blessing of the Bronze',
    icon: 'ability_evoker_blessingofthebronze',
  },
  SOURCE_OF_MAGIC_MANA_GAIN: {
    id: 372571,
    name: 'Source of Magic',
    icon: 'ability_evoker_blue_01',
  },
  LIVING_FLAME_DAMAGE: {
    id: 361500,
    name: 'Living Flame',
    icon: 'ability_evoker_livingflame',
    manaCost: 5500,
  },
  LIVING_FLAME_HEAL: {
    id: 361509,
    name: 'Living Flame',
    icon: 'ability_evoker_livingflame',
    manaCost: 5500,
  },
  LIVING_FLAME_CAST: {
    id: 361469,
    name: 'Living Flame',
    icon: 'ability_evoker_livingflame',
    manaCost: 5500,
  },
  AZURE_STRIKE: {
    id: 362969,
    name: 'Azure Strike',
    icon: 'ability_evoker_azurestrike',
  },
  EMERALD_BLOSSOM: {
    id: 355916,
    name: 'Emerald Blossom',
    icon: 'ability_evoker_emeraldblossom',
    essenceCost: 3,
    manaCost: 13000,
  },
  EMERALD_BLOSSOM_ECHO: {
    id: 376832,
    name: 'Emerald Blossom',
    icon: 'ability_evoker_emeraldblossom',
  },
  EMERALD_BLOSSOM_CAST: {
    id: 355913,
    name: 'Emerald Blossom',
    icon: 'ability_evoker_emeraldblossom',
    essenceCost: 3,
    manaCost: 12000,
  },
  BURNOUT_BUFF: {
    id: 375802,
    name: 'Burnout',
    icon: 'spell_fire_soulburn',
  },
  SNAPFIRE_BUFF: {
    id: 370818,
    name: 'Snapfire',
    icon: 'spell_shaman_improvedfirenova',
  },
  ESSENCE_BURST_BUFF: {
    id: 369299,
    name: 'Essence Burst',
    icon: 'ability_evoker_essenceburst',
  },
  PANACEA_HEAL: {
    id: 387763,
    name: 'Panacea',
    icon: 'ability_druid_protectionofthegrove',
  },
  DEEP_BREATH: {
    id: 357210,
    name: 'Deep Breath',
    icon: 'ability_evoker_deepbreath',
  },
  DEEP_BREATH_SCALECOMMANDER: {
    id: 433874,
    name: 'Deep Breath',
    icon: 'ability_evoker_deepbreath',
  },
  DEEP_BREATH_DAM: {
    id: 353759,
    name: 'Deep Breath',
    icon: 'ability_evoker_deepbreath',
  },
  FIRE_BREATH: {
    id: 357208,
    name: 'Fire Breath',
    icon: 'ability_evoker_firebreath',
    manaCost: 6500,
  },
  FIRE_BREATH_DOT: {
    id: 357209,
    name: 'Fire Breath',
    icon: 'ability_evoker_firebreath',
  },
  FIRE_BREATH_FONT: {
    id: 382266,
    name: 'Fire Breath',
    icon: 'ability_evoker_firebreath',
    manaCost: 6500,
  },
  DISINTEGRATE: {
    id: 356995,
    name: 'Disintegrate',
    icon: 'ability_evoker_disintegrate',
  },
  HOVER: {
    id: 358267,
    name: 'Hover',
    icon: 'ability_evoker_hover',
  },
  HOVER_BUFF: {
    id: 358268,
    name: 'Hover',
    icon: 'ability_evoker_hover',
  },
  RETURN: {
    id: 361227,
    name: 'Return',
    icon: 'ability_evoker_return',
  },
  PERMEATING_CHILL: {
    id: 381773,
    name: 'Permeating Chill',
    icon: 'spell_frost_coldhearted',
  },
  FURY_OF_THE_ASPECTS: {
    id: 390386,
    name: 'Fury of the Aspects',
    icon: 'ability_evoker_furyoftheaspects',
  },
  RENEWING_BLAZE_HEAL: {
    id: 374349,
    name: 'Renewing Blaze',
    icon: 'ability_evoker_masterylifebinder_red',
  },
  VERDANT_EMBRACE_HEAL: {
    id: 361195,
    name: 'Verdant Embrace',
    icon: 'ability_evoker_rescue',
  },
  STASIS_BUFF: {
    id: 370562,
    name: 'Stasis',
    icon: 'ability_evoker_stasis',
  },
  GIANT_SLAYER_MASTERY: {
    id: 362980,
    name: 'Mastery: Giantkiller',
    icon: ' ability_evoker_masterygiantkiller',
  },
  EXHIL_BURST_BUFF: {
    id: 377102,
    name: 'Exhilarating Burst',
    icon: 'ability_evoker_essenceburst3',
  },
  LIFEBIND_BUFF: {
    id: 373267,
    name: 'Lifebind',
    icon: 'ability_evoker_hoverred',
  },
  ENERGY_LOOP_BUFF: {
    id: 372234,
    name: 'Energy Loop',
    icon: 'inv_elemental_mote_mana',
  },
  TEMPORAL_COMPRESSION_BUFF: {
    id: 362877,
    name: 'Temporal Compression',
    icon: 'ability_evoker_rewind2',
  },
  OUROBOROS_BUFF: {
    id: 387350,
    name: 'Ouroboros',
    icon: 'ability_evoker_innatemagic',
  },
  BLAZING_SHARDS: {
    // T30 4pc buff
    id: 409848,
    name: 'Blazing Shards',
    icon: 'inv_elemental_crystal_shadow',
  },
  OBSIDIAN_SHARDS: {
    // T30 2pc dot
    id: 409776,
    name: 'Obsidian Shards',
    icon: 'inv_elemental_crystal_shadow',
  },
  IRIDESCENCE_BLUE: {
    id: 386399,
    name: 'Iridescence: Blue',
    icon: 'inv_enchant_shardgleamingsmall',
  },
  IRIDESCENCE_RED: {
    id: 386353,
    name: 'Iridescence: Red',
    icon: 'inv_enchant_shardradientsmall',
  },
  GLIDE_EVOKER: {
    id: 358733,
    name: 'Glide',
    icon: 'ability_racial_glide',
  },
  LEAPING_FLAMES_BUFF: {
    id: 370901,
    name: 'Leaping Flames',
    icon: 'spell_fire_flare',
  },
  ANCIENT_FLAME_BUFF: {
    id: 375583,
    name: 'Ancient Flame',
    icon: 'inv_elemental_mote_fire01',
  },
  FIRESTORM_DAMAGE: {
    id: 369374,
    name: 'Firestorm',
    icon: 'ability_evoker_firestorm',
  },
  VISAGE: {
    id: 351239,
    name: 'Visage',
    icon: 'ability_racial_visage',
  },
  WING_BUFFET: {
    id: 357214,
    name: 'Wing Buffet',
    icon: 'ability_racial_wingbuffet',
  },
  TAIL_SWIPE: {
    id: 368970,
    name: 'Tail Swipe',
    icon: 'ability_racial_tailswipe',
  },
  OPPRESING_ROAR: {
    id: 406971,
    name: 'Oppressing Roar',
    icon: 'ability_evoker_oppressingroar',
  },
  UNRAVEL: {
    id: 368432,
    name: 'Unravel',
    icon: 'ability_evoker_unravel',
  },
  POWER_SWELL_BUFF: {
    id: 376850,
    name: 'Power Swell',
    icon: 'ability_evoker_powernexus2',
  },
  // Augmentation Spells
  UPHEAVAL: {
    id: 396286,
    name: 'Upheaval',
    icon: 'ability_evoker_upheaval',
  },
  UPHEAVAL_FONT: {
    id: 408092,
    name: 'Upheaval',
    icon: 'ability_evoker_upheaval',
  },
  UPHEAVAL_DAM: {
    id: 396288,
    name: 'Upheaval',
    icon: 'ability_evoker_upheaval',
  },
  ESSENCE_BURST_AUGMENTATION_BUFF: {
    id: 392268,
    name: 'Essence Burst',
    icon: 'ability_evoker_essenceburst',
  },
  EBON_MIGHT_BUFF_PERSONAL: {
    id: 395296,
    name: 'Ebon Might',
    icon: 'spell_sarkareth',
  },
  EBON_MIGHT_BUFF_EXTERNAL: {
    id: 395152,
    name: 'Ebon Might',
    icon: 'spell_sarkareth',
  },
  SANDS_OF_TIME: {
    id: 395153,
    name: 'Sands of Time',
    icon: 'ability_evoker_sandsoftime',
  },
  PRESCIENCE_BUFF: {
    id: 410089,
    name: 'Prescience',
    icon: 'ability_evoker_prescience',
  },
  SHIFTING_SANDS_BUFF: {
    id: 413984,
    name: 'Shifting Sands',
    icon: 'ability_evoker_masterytimewalker',
  },
  TEMPORAL_WOUND_DEBUFF: {
    id: 409560,
    name: 'Temporal Wound',
    icon: 'ability_evoker_breathofeons',
  },
  BREATH_OF_EONS_DAMAGE: {
    id: 409632,
    name: 'Temporal Wound',
    icon: 'ability_evoker_breathofeons',
  },
  BREATH_OF_EONS_SCALECOMMANDER: {
    id: 442204,
    name: 'Breath of Eons',
    icon: 'ability_evoker_breathofeons',
  },
  MELT_ARMOR: {
    id: 441172,
    name: 'Melt Armor',
    icon: 'inv_10_gearupgrade_drakesshadowflameenhancedcrest',
  },
  BOMBARDMENTS_DAMAGE: {
    id: 434481,
    name: 'Bombardments',
    icon: 'inv_ability_scalecommanderevoker_bombardments',
  },
  BOMBARDMENTS_DEBUFF: {
    id: 434473,
    name: 'Bombardments',
    icon: 'inv_ability_scalecommanderevoker_bombardments',
  },
  BLACK_ATTUNEMENT: {
    id: 403264,
    name: 'Black Attunement',
    icon: 'ability_evoker_blackattunement',
  },
  BLISTERING_SCALES_DAM: {
    id: 360828,
    name: 'Blistering Scales',
    icon: 'ability_evoker_blisteringscales',
  },
  REACTIVE_HIDE_BUFF: {
    id: 410256,
    name: 'Reactive Hide',
    icon: 'ability_evoker_reactivehide',
  },
  SYMBIOTIC_BLOOM_BUFF: {
    id: 410686,
    name: 'Symbiotic Bloom',
    icon: 'inv_10_herb_seed_magiccolor5',
  },
  TREMBLING_EARTH_BUFF: {
    id: 424368,
    name: 'Trembling Earth',
    icon: 'ability_evoker_eruption',
  },
  TREMBLING_EARTH_DAM: {
    id: 424428,
    name: 'Trembling Earth',
    icon: 'ability_evoker_eruption',
  },
  TIME_OF_NEED_LIVING_FLAME: {
    id: 401382,
    name: 'Living Flame (Past Self)',
    icon: 'ability_evoker_livingflame',
  },
  TIME_OF_NEED_SUMMON: {
    id: 368415,
    name: 'Time of Need',
    icon: 'ability_evoker_masterylifebinder_bronze',
  },
  TIME_BENDER: {
    id: 394544,
    name: 'Time Bender',
    icon: 'ability_evoker_masterylifebinder_bronze',
  },
  LIFESPARK_BUFF: {
    id: 443176,
    name: 'Lifespark',
    icon: 'ability_evoker_masterylifebinder_red',
  },
  EPOCH_FRAGMENT: {
    id: 456083,
    name: 'Epoch Fragment',
    icon: 'ability_evoker_bronze_01',
  },
  T32_4PC_BUFF: {
    id: 456058,
    name: 'Recommencement',
    icon: 'ability_evoker_bronze_01',
  },
  ENKINDLE_HOT: {
    id: 445740,
    name: 'Enkindle',
    icon: 'spell_fire_burnout',
  },
  ENKINDLE_DOT: {
    id: 444017,
    name: 'Enkindle',
    icon: 'spell_fire_burnout',
  },
  ENGULF_DAMAGE: {
    id: 443329,
    name: 'Engulf',
    icon: 'inv_ability_flameshaperevoker_engulf',
  },
  ENGULF_HEAL: {
    id: 443330,
    name: 'Engulf',
    icon: 'inv_ability_flameshaperevoker_engulf',
  },
  CONSUME_FLAME_HEAL: {
    id: 445495,
    name: 'Consume Flame',
    icon: 'inv_shadowflames_wave',
  },
  CONSUME_FLAME_DAMAGE: {
    id: 444089,
    name: 'Consume Flame',
    icon: 'inv_shadowflames_wave',
  },
  SPIRITBLOOM_HOT: {
    id: 409895,
    name: 'Spiritbloom',
    icon: 'ability_evoker_spiritbloom2',
  },
  CHRONO_FLAME_CAST: {
    id: 431443,
    name: 'Chronoflame',
    icon: 'inv_ability_chronowardenevoker_chronoflame',
  },
  CHRONO_FLAME_HEAL: {
    id: 431483,
    name: 'Chronoflame',
    icon: 'inv_ability_chronowardenevoker_chronoflame',
  },
  CHRONO_FLAME_DAMAGE: {
    id: 431583,
    name: 'Chronoflame',
    icon: 'inv_ability_chronowardenevoker_chronoflame',
  },
  THREADS_OF_FATE_HEALING: {
    id: 432896,
    name: 'Threads of Fate',
    icon: 'ability_evoker_sandsoftime',
  },
  THREADS_OF_FATE_DAMAGE: {
    id: 432895,
    name: 'Threads of Fate',
    icon: 'ability_evoker_sandsoftime',
  },
  IMMINENT_DESTRUCTION_DEV_BUFF: {
    id: 411055,
    name: 'Imminent Destruction',
    icon: 'spell_burningbladeshaman_blazing_radiance',
  },
  IMMINENT_DESTRUCTION_AUG_BUFF: {
    id: 459574,
    name: 'Imminent Destruction',
    icon: 'spell_burningbladeshaman_blazing_radiance',
  },
  // region Scalecommander
  MASS_DISINTEGRATE_BUFF: {
    id: 436336,
    name: 'Mass Disintegrate',
    icon: 'ability_evoker_disintegrate',
  },
  MASS_ERUPTION_BUFF: {
    id: 438588,
    name: 'Mass Eruption',
    icon: 'ability_evoker_eruption',
  },
  MASS_ERUPTION_DAMAGE: {
    id: 438653,
    name: 'Mass Eruption',
    icon: 'ability_evoker_eruption',
  },
  UNRELENTING_SIEGE_BUFF: {
    id: 441248,
    name: 'Unrelenting Siege',
    icon: 'ability_siege_engineer_superheated',
  },
  // endregion
} satisfies Record<string, Spell>;

export default spells;
