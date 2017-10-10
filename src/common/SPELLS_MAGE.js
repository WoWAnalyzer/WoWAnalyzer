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
  MASTERY_ICICLES: {
	  id: 76613,
	  name: 'Mastery: Icicles',
	  icon: 'spell_frost_iceshard',
  },
  FROSTBOLT: {
	  id: 116,
	  name: 'Frostbolt',
	  icon: 'spell_frost_frostbolt02',
  },
  ICE_LANCE: {
	  id: 228598,
	  name: 'Ice Lance',
	  icon: 'spell_frost_frostblast',
  },
  BLIZZARD: {
	  id: 190356,
	  name: 'Blizzard',
	  icon: 'spell_frost_icestorm',
  },
  FLURRY: {
	  id: 44614,
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
  FROZEN_ORB: {
	  id: 84714,
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
  EBONBOLT: {
	  id: 214634,
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
