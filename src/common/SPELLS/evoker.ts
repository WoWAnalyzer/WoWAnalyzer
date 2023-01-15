/**
 * All Evoker abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import { spellIndexableList } from './Spell';

const spells = spellIndexableList({
  // Preservation Spells
  MASTERY_LIFEBINDER: {
    id: 363510,
    name: 'Mastery: Life-Binder',
    icon: 'ability_evoker_masterylifebinder',
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
    icon: '',
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
  EMERALD_COMMUNION_SELF: {
    id: 370960,
    name: 'Emerald Communion',
    icon: 'ability_evoker_green_01',
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
  // Devestation Spells
  ETERNITY_SURGE: {
    id: 359073,
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

  // Shared
  BLESSING_OF_THE_BRONZE: {
    id: 364342,
    name: 'Blessing of the Bronze',
    icon: 'ability_evoker_blessingofthebronze',
  },
  LIVING_FLAME_DAMAGE: {
    id: 361500,
    name: 'Living Flame',
    icon: 'ability_evoker_livingflame',
    manaCost: 5000,
  },
  LIVING_FLAME_HEAL: {
    id: 361509,
    name: 'Living Flame',
    icon: 'ability_evoker_livingflame',
    manaCost: 5000,
  },
  LIVING_FLAME_CAST: {
    id: 361469,
    name: 'Living Flame',
    icon: 'ability_evoker_livingflame',
    manaCost: 5000,
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
    manaCost: 12000,
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
  FIRE_BREATH: {
    id: 357208,
    name: 'Fire Breath',
    icon: 'ability_evoker_firebreath',
  },
  FIRE_BREATH_FONT: {
    id: 382266,
    name: 'Fire Breath',
    icon: 'ability_evoker_firebreath',
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
});

export default spells;
