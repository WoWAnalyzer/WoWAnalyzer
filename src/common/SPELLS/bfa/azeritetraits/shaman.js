/**
 * All Shaman azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // COMMON
  ANCESTRAL_RESONANCE: {
    id: 277666,
    name: 'Ancestral Resonance',
    icon: 'spell_shaman_improvedreincarnation',
  },
  ANCESTRAL_RESONANCE_BUFF: {
    id: 277943,
    name: 'Ancestral Resonance',
    icon: 'spell_shaman_improvedreincarnation',
  },
  NATURAL_HARMONY_TRAIT: {
    id: 278697,
    name: 'Natural Harmony',
    icon: 'spell_nature_elementalprecision_1',
  },
  NATURAL_HARMONY_FIRE_BUFF: {
    id: 279028,
    name: 'Natural Harmony: Fire',
    icon: 'spell_nature_elementalprecision_1',
  },
  NATURAL_HARMONY_FROST_BUFF: {
    id: 279029,
    name: 'Natural Harmony: Frost',
    icon: 'spell_nature_elementalprecision_1',
  },
  NATURAL_HARMONY_NATURE_BUFF: {
    id: 279033,
    name: 'Natural Harmony: Nature',
    icon: 'spell_nature_elementalprecision_1',
  },
  SYNAPSE_SHOCK: {
    id: 277671,
    name: 'Synapse Shock',
    icon: 'spell_nature_lightning',
  },
  SYNAPSE_SHOCK_BUFF: {
    id: 277960,
    name: 'Synapse Shock',
    icon: 'spell_nature_lightning',
  },
  // Enhancement
  LIGHTNING_CONDUIT_TRAIT: {
    id: 275388,
    name: 'Lightning Conduit',
    icon: 'inv_rod_enchantedcobalt',
  },
  LIGHTNING_CONDUIT_DAMAGE: {
    id: 275394,
    name: 'Lightning Conduit',
    icon: 'inv_rod_enchantedcobalt',
  },
  PRIMAL_PRIMER_TRAIT: {
    id: 272992,
    name: 'Primal Primer',
    icon: 'ability_shaman_lavalash',
  },
  PRIMAL_PRIMER_DEBUFF: {
    id: 273006,
    name: 'Primal Primer',
    icon: 'ability_shaman_lavalash',
  },
  ROILING_STORM: {
    id: 278719,
    name: 'Roiling Storm',
    icon: 'ability_shaman_stormstrike',
  },
  STRENGTH_OF_EARTH_TRAIT: {
    id: 273461,
    name: 'Strength of Earth',
    icon: 'spell_nature_rockbiter',
  },
  STRENGTH_OF_EARTH_DAMAGE: {
    id: 273466,
    name: 'Strength of Earth',
    icon: 'spell_nature_rockbiter',
  },
  THUNDERAANS_FURY: {
    id: 287768,
    name: 'Thunderaan\'s Fury',
    icon: 'spell_nature_invisibilitytotem',
  },
  // Elemental
  LAVA_SHOCK: {
    id: 273448,
    name: 'Lava Shock',
    icon: 'spell_nature_earthshock',
  },
  LAVA_SHOCK_BUFF: {
    id: 273453,
    name: 'Lava Shock',
    icon: 'spell_nature_earthshock',
  },
  ECHO_OF_THE_ELEMENTALS: {
    id: 275381,
    name: 'Echo of the Elementals',
    icon: 'spell_fire_elemental_totem',
  },
  EMBER_ELEMENTAL_SUMMON: {
    id: 275385,
    name: 'Summon Ember Elemental',
    icon: 'spell_fire_elemental_totem',
  },
  SPARK_ELEMENTAL_SUMMON: {
    id: 275386,
    name: 'Summon Spark Elemental',
    icon: 'spell_shaman_measuredinsight',
  },
  EMBER_BLAST: {
    id: 275382,
    name: 'Ember Blase',
    icon: 'spell_fire_fireball',
  },
  SHOCKING_BLAST: {
    id: 275384,
    name: 'Shocking Blast',
    icon: 'spell_nature_cyclone',
  },
  IGNEOUS_POTENTIAL: {
    id: 279829,
    name: 'Igneous Potential',
    icon: 'spell_shaman_lavasurge',
  },
  // Restoration
  OVERFLOWING_SHORES_TRAIT: {
    id: 277658,
    name: 'Overflowing Shores',
    icon: 'spell_nature_giftofthewaterspirit',
  },
  OVERFLOWING_SHORES_HEAL: {
    id: 278095,
    name: 'Overflowing Shores',
    icon: 'spell_nature_giftofthewaterspirit',
  },
  SWELLING_STREAM: {
    id: 275488,
    name: 'Swelling Stream',
    icon: 'inv_spear_04',
  },
  SWELLING_STREAM_HEAL: {
    id: 275499,
    name: 'Swelling Stream',
    icon: 'inv_spear_04',
  },
  SURGING_TIDES: {
    id: 278713,
    name: 'Surging Tides',
    icon: 'spell_nature_riptide',
  },
  SURGING_TIDES_ABSORB: {
    id: 279187,
    name: 'Surging Tides',
    icon: 'spell_nature_riptide',
  },
  SPOUTING_SPIRITS: {
    id: 278715,
    name: 'Spouting Spirits',
    icon: 'spell_shaman_spiritlink',
  },
  SPOUTING_SPIRITS_HEAL: {
    id: 279505,
    name: 'Spouting Spirits',
    icon: 'spell_shaman_spiritlink',
  },
  SOOTHING_WATERS_TRAIT: {
    id: 272989,
    name: 'Soothing Waters',
    icon: 'spell_nature_healingwavegreater',
  },
  SERENE_SPIRIT_TRAIT: {
    id: 274412,
    name: 'Serene Spirit',
    icon: 'ability_shaman_astralshift',
  },
  SERENE_SPIRIT_HEAL: {
    id: 274416,
    name: 'Serene Spirit',
    icon: 'ability_shaman_astralshift',
  },
  PACK_SPIRIT_TRAIT: {
    id: 280021,
    name: 'Pack Spirit',
    icon: 'spell_nature_spiritwolf',
  },
  PACK_SPIRIT_HEAL: {
    id: 280205,
    name: 'Pack Spirit',
    icon: 'spell_nature_spiritwolf',
  },
  TURN_OF_THE_TIDE_TRAIT: {
    id: 287300,
    name: 'Turn of the Tide',
    icon: 'spell_shaman_tidalwaves',
  },
};
