/**
 * All Mage abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  //General
  FROST_NOVA: {
	  id: 122,
	  name: 'Frost Nova',
	  icon: 'spell_frost_frostnova',
  }, 
  BLINK: {
	  id: 1953,
	  name: 'Blink',
	  icon: 'spell_arcane_blink',
  },
  COUNTERSPELL: {
	  id: 2139,
	  name: 'Counterspell',
	  icon: 'spell_frost_iceshock',
  },
  SLOW_FALL: {
	  id: 130,
	  name: 'Slow Fall',
	  icon: 'spell_magic_featherfall',
  },
  ICE_BLOCK: {
	  id: 45438,
	  name: 'Ice Block',
	  icon: 'spell_frost_frost',
  },
  SPELL_STEAL: {
	  id: 30449,
	  name: 'Spell Steal',
	  icon: 'spell_arcane_arcane02',
  },
  INVISIBILITY: {
	  id: 66,
	  name: 'Invisibility',
	  icon: 'ability_mage_invisibility',
  },
  TIME_WARP: {
    id: 80353,
    name: 'Time Warp',
    icon: 'ability_mage_timewarp',
  },
  
  //Frost
  MATSERY_ICICLES: {
	  id: 76613,
	  name: 'Mastery: Icicles',
	  icon: 'spell_frost_iceshard',
  },
  FROSTBOLT_CAST: {
	  id: 116,
	  name: 'Frostbolt',
	  icon: 'spell_frost_frostbolt02',
  },
  FROSTBOLT_DEBUFF: {
	  id: 228597,
	  name: 'Frostbolt',
	  icon: 'spell_frost_frostbolt02',
  },
  ICE_LANCE_CAST: {
	  id: 30455,
	  name: 'Ice Lance',
	  icon: 'spell_frost_frostblast',
  },
  ICE_LANCE_DEBUFF: {
	  id: 228598,
	  name: 'Ice Lance',
	  icon: 'spell_frost_frostblast',
  },
  BLIZZARD_CAST: {
	  id: 190356,
	  name: 'Blizzard',
	  icon: 'spell_frost_icestorm',
  },
  BLIZZARD_DEBUFF: {
	  id: 190357,
	  name: 'Blizzard',
	  icon: 'spell_frost_icestorm',
  },
  FLURRY_CAST: {
	  id: 44614,
	  name: 'Flurry',
	  icon: 'ability_warlock_burningembersblue',
  },
  FLURRY_DEBUFF: {
	  id: 228354,
	  name: 'Flurry',
	  icon: 'ability_warlock_burningembersblue',
  },
  ICE_BARRIER: {
	  id: 11426,
	  name: 'Ice Barrier',
	  icon: 'spell_ice_lament',
  },
  CONE_OF_COLD: {
	  id: 120,
	  name: 'Cone of Cold',
	  icon: 'spell_frost_glacier',
  },
  ICY_VEINS: {
	  id: 12472,
	  name: 'Icy Veins',
	  icon: 'spell_frost_coldhearted',
  },
  COLD_SNAP: {
	  id: 235219,
	  name: 'Cold Snap',
	  icon: 'spell_frost_wizardmark',
  },
  FROZEN_ORB_CAST: {
	  id: 84714,
	  name: 'Frozen Orb',
	  icon: 'spell_frost_frozenorb',
  },
  FROZEN_ORB_DEBUFF: {
	  id: 84721,
	  name: 'Frozen Orb',
	  icon: 'spell_frost_frozenorb',
  },
  SUMMON_WATER_ELEMENTAL: {
	  id: 31687,
	  name: 'Summon Water Elemental',
	  icon: 'spell_frost_summonwaterelemental_2',
  },
  WATER_JET: {
	  id: 135029,
	  name: 'Water Jet',
	  icon: 'ability_mage_waterjet',
  },
  EBONBOLT_CAST: {
	  id: 214634,
	  name: 'Ebonbolt',
	  icon: 'artifactability_frostmage_ebonbolt',
  },
  EBONBOLT_DEBUFF: {
	  id: 228599,
	  name: 'Ebonbolt',
	  icon: 'artifactability_frostmage_ebonbolt',
  },
  
  //Passives
  SHATTER: {
	  id: 12982,
	  name: 'Shatter',
	  icon: 'spell_frost_frostshock',
  },
  FREEZE: {
	  id: 231596,
	  name: 'Freeze',
	  icon: 'spell_frost_frostshock',
  },
  GLACIAL_ERUPTION: {
	  id: 242851,
	  name: 'Glacial Eruption',
	  icon: 'creatureportrait_creature_iceblock',
  },
  ICICLES: {
	  id: 148022,
	  name: 'Icicle',
	  icon: 'spell_frost_iceshard',
  },
  
  //Abilities From Talents
  RAY_OF_FROST: {
	  id: 205021,
	  name: 'Ray of Frost',
	  icon: 'ability_mage_rayoffrost',
  },
  SHIMMER: {
	  id: 212653,
	  name: 'Shimmer',
	  icon: 'spell_arcane_massdispel',
  },
  ICE_FLOES: {
	  id: 108839,
	  name: 'Ice Floes',
	  icon: 'spell_mage_iceflows',
  },
  MIRROR_IMAGE: {
	  id: 55342,
	  name: 'Mirror Image',
	  icon: 'spell_magic_lesserinvisibilty',
  },
  RUNE_OF_POWER: {
	  id: 116011,
	  name: 'Rune of Power',
	  icon: 'spell_mage_runeofpower',
  },
  ICE_NOVA: {
	  id: 157997,
	  name: 'Ice Nova',
	  icon: 'spell_mage_icenova',
  },
  RING_OF_FROST: {
	  id: 113724,
	  name: 'Ring of Frost',
	  icon: 'spell_frost_ring-of-frost',
  },
  FROST_BOMB: {
	  id: 112948,
	  name: 'Frost Bomb',
	  icon: 'spell_mage_frostbomb',
  },
  GLACIAL_SPIKE: {
	  id: 228600,
	  name: 'Glacial Spike',
	  icon: 'spell_frost_frostbolt',
  },
  COMET_STORM_CAST: {
	  id: 153595,
	  name: 'Comet Storm',
	  icon: 'spell_mage_cometstorm',
  },
  COMET_STORM_DEBUFF: {
	  id: 153596,
	  name: 'Comet Storm',
	  icon: 'spell_mage_cometstorm',
  },
  
  
  //Buffs
  BONE_CHILLING: {
	  id: 205027,
	  name: 'Bone Chilling',
	  icon: 'ability_mage_chilledtothebone',
  },
  BRAIN_FREEZE: {
	  id: 190446,
	  name: 'Brain Freeze',
	  icon: 'ability_mage_brainfreeze',
  },
  FINGERS_OF_FROST: {
	  id: 44544,
	  name: 'Fingers of Frost',
	  icon: 'ability_mage_wintersgrasp',
  },
  WINTERS_CHILL: {
	  id: 228358,
	  name: 'Winter\'s Chill',
	  icon: 'spell_frost_frostward',
  },
  GLACIAL_SPIKE_BUFF: {
	  id: 199844,
	  name: 'Glacial Spike!',
	  icon: 'spell_frost_frostbolt',
  },
  ICICLES_BUFF: {
	  id: 205473,
	  name: 'Icicles',
	  icon: 'spell_frost_iceshard',
  },
  //Tier Sets
  FROST_MAGE_T20_2SET_BONUS_BUFF: {
	  id: 242253,
	  name: 'T20 2 Set Bonus',
	  icon: 'spell_frost_frozenorb',
  },
  

};
