/**
 * All WotLK Mage spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------

  ARCANE_BLAST: {
    id: 30451,
    name: 'Arcane Blast',
    icon: 'spell_arcane_blast.jpg',
  },
  ARCANE_BRILLIANCE: {
    id: 1459,
    name: 'Arcane Brilliance',
    icon: 'spell_holy_arcaneintellect.jpg',
  },
  ARCANE_EXPLOSION: {
    id: 1449,
    name: 'Arcane Explosion',
    icon: 'spell_nature_wispsplode.jpg',
  },
  ARCANE_MISSILES: {
    id: 7268, // Tick id registered by WCLs
    name: 'Arcane Missiles',
    icon: 'spell_nature_starfall.jpg',
  },
  BLINK: {
    id: 1953,
    name: 'Blink',
    icon: 'spell_arcane_blink.jpg',
  },
  BLIZZARD: {
    id: 10,
    name: 'Blizzard',
    icon: 'spell_frost_icestorm.jpg',
  },
  BLIZZARD_TICK: {
    id: 42208,
    name: 'Blizzard',
    icon: 'spell_frost_icestorm.jpg',
  },
  CONE_OF_COLD: {
    id: 120,
    name: 'Cone of Cold',
    icon: 'spell_frost_glacier.jpg',
  },
  CONJURE_MANA_GEM: {
    id: 759,
    name: 'Conjure Mana Gem',
    icon: 'inv_misc_gem_sapphire_02.jpg',
  },
  CONJURE_REFRESHMENT: {
    id: 42955,
    name: 'Conjure Refreshment',
    icon: 'ability_mage_conjurefoodrank10.jpg',
  },
  COUNTERSPELL: {
    id: 2139,
    name: 'Counterspell',
    icon: 'spell_frost_iceshock.jpg',
  },
  DALARAN_BRILLIANCE: {
    id: 61316,
    name: 'Dalaran Brilliance',
    icon: 'achievement_dungeon_theviolethold_heroic.jpg',
  },
  EVOCATION: {
    id: 12051,
    name: 'Evocation',
    icon: 'spell_nature_purge.jpg',
  },
  FIRE_BLAST: {
    id: 2136,
    name: 'Fire Blast',
    icon: 'spell_fire_fireball.jpg',
  },
  FIRE_POWER: {
    id: 83619,
    name: 'Fire Power',
    icon: 'ability_mage_burnout.jpg',
  },
  FIREBALL: {
    id: 133,
    name: 'Fireball',
    icon: 'spell_fire_flamebolt.jpg',
  },
  FLAME_ORB: {
    id: 82731,
    name: 'Flame Orb',
    icon: 'spell_mage_flameorb.jpg',
  },
  FLAMESTRIKE: {
    id: 2120,
    name: 'Flamestrike',
    icon: 'spell_fire_selfdestruct.jpg',
  },
  FROST_ARMOR: {
    id: 7302,
    name: 'Frost Armor',
    icon: 'spell_frost_frostarmor02.jpg',
  },
  FROST_NOVA: {
    id: 122,
    name: 'Frost Nova',
    icon: 'spell_frost_frostnova.jpg',
  },
  FROSTBOLT: {
    id: 116,
    name: 'Frostbolt',
    icon: 'spell_frost_frostbolt02.jpg',
  },
  FROSTFIRE_BOLT: {
    id: 44614,
    name: 'Frostfire Bolt',
    icon: 'ability_mage_frostfirebolt.jpg',
  },
  ICE_BLOCK: {
    id: 45438,
    name: 'Ice Block',
    icon: 'spell_frost_frost.jpg',
  },
  ICE_LANCE: {
    id: 30455,
    name: 'Ice Lance',
    icon: 'spell_frost_frostblast.jpg',
  },
  INVISIBILITY: {
    id: 66,
    name: 'Invisibility',
    icon: 'ability_mage_invisibility.jpg',
  },
  MAGE_ARMOR: {
    id: 6117,
    name: 'Mage Armor',
    icon: 'spell_magearmor.jpg',
  },
  MAGE_WARD: {
    id: 543,
    name: 'Mage Ward',
    icon: 'spell_fire_twilightfireward.jpg',
  },
  MANA_SHIELD: {
    id: 1463,
    name: 'Mana Shield',
    icon: 'spell_shadow_detectlesserinvisibility.jpg',
  },
  MIRROR_IMAGE: {
    id: 55342,
    name: 'Mirror Image',
    icon: 'spell_magic_lesserinvisibilty.jpg',
  },
  MOLTEN_ARMOR: {
    id: 30482,
    name: 'Molten Armor',
    icon: 'ability_mage_moltenarmor.jpg',
  },
  POLYMORPH: {
    id: 118,
    name: 'Polymorph',
    icon: 'spell_nature_polymorph.jpg',
  },
  POLYMORPH_BLACK_CAT: {
    id: 61305,
    name: 'Polymorph',
    icon: 'achievement_halloween_cat_01.jpg',
  },
  POLYMORPH_PIG: {
    id: 28272,
    name: 'Polymorph',
    icon: 'spell_magic_polymorphpig.jpg',
  },
  POLYMORPH_RABBIT: {
    id: 61721,
    name: 'Polymorph',
    icon: 'spell_magic_polymorphrabbit.jpg',
  },
  POLYMORPH_TURKEY: {
    id: 61780,
    name: 'Polymorph',
    icon: 'achievement_worldevent_thanksgiving.jpg',
  },
  POLYMORPH_TURTLE: {
    id: 28271,
    name: 'Polymorph',
    icon: 'ability_hunter_pet_turtle.jpg',
  },
  PYROBLAST: {
    id: 92315,
    name: 'Pyroblast!',
    icon: 'spell_fire_fireball02.jpg',
  },
  REMOVE_CURSE: {
    id: 475,
    name: 'Remove Curse',
    icon: 'spell_nature_removecurse.jpg',
  },
  REPLENISH_MANA: {
    // Use Mage mana gem
    id: 5405,
    name: 'Mana Gem',
    icon: 'inv_misc_gem_sapphire_02.jpg',
  },
  RING_OF_FROST: {
    id: 82676,
    name: 'Ring of Frost',
    icon: 'spell_frost_ring-of-frost.jpg',
  },
  SCORCH: {
    id: 2948,
    name: 'Scorch',
    icon: 'spell_fire_soulburn.jpg',
  },
  SLOW_FALL: {
    id: 130,
    name: 'Slow Fall',
    icon: 'spell_magic_featherfall.jpg',
  },
  SPELLSTEAL: {
    id: 30449,
    name: 'Spellsteal',
    icon: 'spell_arcane_arcane02.jpg',
  },
  TIME_WARP: {
    id: 80353,
    name: 'Time Warp',
    icon: 'ability_mage_timewarp.jpg',
  },

  // ---------
  // TALENTS
  // ---------

  // Arcane
  ARCANE_BARRAGE: {
    id: 44425,
    name: 'Arcane Barrage',
    icon: 'ability_mage_arcanebarrage.jpg',
  },
  ARCANE_POWER: {
    id: 12042,
    name: 'Arcane Power',
    icon: 'spell_nature_lightning.jpg',
  },
  FOCUS_MAGIC: {
    id: 54648,
    name: 'Focus Magic',
    icon: 'spell_arcane_studentofmagic.jpg',
  },
  INCANTERS_ABSORPTION_BUFF: {
    id: 44413,
    name: "Incanter's Absorption",
    icon: 'spell_arcane_studentofmagic.jpg',
  },
  PRESENCE_OF_MIND: {
    id: 12043,
    name: 'Presence of Mind',
    icon: 'spell_nature_enchantarmor.jpg',
  },
  SLOW: {
    id: 31589,
    name: 'Slow',
    icon: 'spell_nature_slow.jpg',
  },

  // Fire
  BLAST_WAVE: {
    id: 11113,
    name: 'Blast Wave',
    icon: 'spell_holy_excorcism_02.jpg',
  },
  COMBUSTION: {
    id: 11129,
    name: 'Combustion',
    icon: 'spell_fire_sealoffire.jpg',
  },
  DRAGONS_BREATH: {
    id: 31661,
    name: "Dragon's Breath",
    icon: 'inv_misc_head_dragon_01.jpg',
  },
  HOT_STREAK: {
    id: 48108,
    name: 'Hot Streak',
    icon: 'ability_mage_hotstreak.jpg',
  },
  IMPACT: {
    id: 64343,
    name: 'Impact',
    icon: 'spell_fire_meteorstorm.jpg',
  },
  LIVING_BOMB: {
    id: 44457,
    name: 'Living Bomb',
    icon: 'ability_mage_livingbomb.jpg',
  },
  PYROBLAST_TALENT: {
    id: 11366,
    name: 'Pyroblast',
    icon: 'spell_fire_fireball02.jpg',
  },
  PYROMANIAC: {
    id: 83582,
    name: 'Pyromaniac',
    icon: 'spell_fire_burnout.jpg',
  },

  // Frost
  COLD_SNAP: {
    id: 11958,
    name: 'Cold Snap',
    icon: 'spell_frost_wizardmark.jpg',
  },
  DEEP_FREEZE: {
    id: 71757,
    name: 'Deep Freeze',
    icon: 'ability_mage_deepfreeze.jpg',
  },
  DEEP_FREEZE_TALENT: {
    id: 44572,
    name: 'Deep Freeze',
    icon: 'ability_mage_deepfreeze.jpg',
  },
  FROSTFIRE_ORB: {
    id: 92283,
    name: 'Frostfire Orb',
    icon: 'spell_firefrost-orb.jpg',
  },
  ICE_BARRIER: {
    id: 11426,
    name: 'Ice Barrier',
    icon: 'spell_ice_lament.jpg',
  },
  ICY_VEINS: {
    id: 12472,
    name: 'Icy Veins',
    icon: 'spell_frost_coldhearted.jpg',
  },
  SUMMON_WATER_ELEMENTAL: {
    id: 31687,
    name: 'Summon Water Elemental',
    icon: 'spell_frost_summonwaterelemental_2.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
