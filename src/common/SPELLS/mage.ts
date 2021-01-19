/**
 * All Mage abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

const spells = {
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
  INVISIBILITY_BUFF: {
    id: 32612,
    name: 'Invisibility',
    icon: 'ability_mage_invisibility',
  },
  TIME_WARP: {
    id: 80353,
    name: 'Time Warp',
    icon: 'ability_mage_timewarp',
  },
  RUNE_OF_POWER_BUFF: {
    id: 116014,
    name: 'Rune of Power',
    icon: 'spell_mage_runeofpower',
  },
  RUNE_OF_POWER_AUTOCAST: {
    id: 342130,
    name: 'Rune of Power',
    icon: 'spell_mage_runeofpower',
  },
  MIRROR_IMAGE: {
    id: 55342,
    name: 'Mirror Image',
    icon: 'spell_magic_lesserinvisibilty',
  },
  MIRROR_IMAGE_SUMMON: {
    id: 88088,
    name: 'Mirror Image',
    icon: 'spell_magic_managain',
  },
  ARCANE_INTELLECT: {
    id: 1459,
    name: 'Arcane Intellect',
    icon: 'spell_holy_magicalsentry',
  },
  FOCUS_MAGIC_CRIT_BUFF: {
    id: 321363,
    name: 'Focus Magic',
    icon: 'spell_arcane_studentofmagic',
  },
  FOCUS_MAGIC_INT_BUFF: {
    id: 334180,
    name: 'Focus Magic',
    icon: 'spell_arcane_studentofmagic',
  },
  ALTER_TIME: {
    id: 342247,
    name: 'Alter Time',
    icon: 'spell_mage_altertime',
  },
  ALTER_TIME_BUFF: {
    id: 342246,
    name: 'Alter Time',
    icon: 'spell_mage_altertime',
  },
  REMOVE_CURSE: {
    id: 475,
    name: 'Remove Curse',
    icon: 'spell_nature_removecurse',
  },
  POLYMORPH_SHEEP: {
    id: 118,
    name: 'Polymorph',
    icon: 'spell_nature_polymorph',
  },
  POLYMORPH_PIG: {
    id: 28272,
    name: 'Polymorph',
    icon: 'spell_magic_polymorphpig',
  },
  POLYMORPH_BLACK_CAT: {
    id: 61305,
    name: 'Polymorph',
    icon: 'achievement_halloween_cat_01',
  },
  POLYMORPH_MONKEY: {
    id: 161354,
    name: 'Polymorph',
    icon: 'ability_hunter_aspectofthemonkey',
  },
  POLYMORPH_RABBIT: {
    id: 61721,
    name: 'Polymorph',
    icon: 'spell_magic_polymorphrabbit',
  },
  POLYMORPH_POLAR_BEAR_CUB: {
    id: 161353,
    name: 'Polymorph',
    icon: 'inv_pet_babyblizzardbear',
  },
  POLYMORPH_PORCUPINE: {
    id: 126819,
    name: 'Polymorph',
    icon: 'inv_pet_porcupine',
  },
  POLYMORPH_TURTLE: {
    id: 28271,
    name: 'Polymorph',
    icon: 'ability_hunter_pet_turtle',
  },
  POLYMORPH_TURKEY: {
    id: 61780,
    name: 'Polymorph',
    icon: 'achievement_worldevent_thanksgiving',
  },
  POLYMORPH_PENGUIN: {
    id: 161355,
    name: 'Polymorph',
    icon: 'inv_misc_penguinpet',
  },
  POLYMORPH_BUMBLEBEE: {
    id: 277792,
    name: 'Polymorph',
    icon: 'inv_bee_default',
  },
  POLYMORPH_PEACOCK: {
    id: 161372,
    name: 'Polymorph',
    icon: 'inv_pet_peacock_gold',
  },
  POLYMORPH_DIREHORN: {
    id: 277787,
    name: 'Polymorph',
    icon: 'inv_pet_direhorn',
  },
  POLYMORPH_MAWRAT: {
    id: 321395,
    name: 'Polymorph',
    icon: 'inv_mawrat',
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
  FROSTBOLT_DAMAGE: {
    id: 228597,
    name: 'Frostbolt',
    icon: 'spell_frost_frostbolt02',
  },
  WATERBOLT: {
    id: 31707,
    name: 'Waterbolt',
    icon: 'spell_frost_frostbolt',
  },
  ICE_LANCE: {
    id: 30455,
    name: 'Ice Lance',
    icon: 'spell_frost_frostblast',
  },
  ICE_LANCE_DAMAGE: {
    id: 228598,
    name: 'Ice Lance',
    icon: 'spell_frost_frostblast',
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
  BLIZZARD: {
    id: 190356,
    name: 'Blizzard',
    icon: 'spell_frost_icestorm',
  },
  BLIZZARD_DAMAGE: {
    id: 190357,
    name: 'Blizzard',
    icon: 'spell_frost_icestorm',
  },
  FLURRY: {
    id: 44614,
    name: 'Flurry',
    icon: 'ability_warlock_burningembersblue',
  },
  FLURRY_DAMAGE: {
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
  SHATTER: {
    id: 12982,
    name: 'Shatter',
    icon: 'spell_frost_frostshock',
  },
  FREEZE: {
    id: 33395,
    name: 'Freeze',
    icon: 'ability_mage_freeze',
  },
  ICICLE_DAMAGE: {
    id: 148022,
    name: 'Icicle',
    icon: 'spell_frost_iceshard',
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
  FROZEN_ORB_DAMAGE: {
    id: 84721,
    name: 'Frozen orb',
    icon: 'spell_frost_frozenorb',
  },
  SUMMON_WATER_ELEMENTAL: {
    id: 31687,
    name: 'Summon Water Elemental',
    icon: 'spell_frost_summonwaterelemental_2',
  },
  EBONBOLT_DAMAGE: {
    id: 257538,
    name: 'Ebonbolt',
    icon: 'artifactability_frostmage_ebonbolt',
  },
  COMET_STORM_DAMAGE: {
    id: 153596,
    name: 'Comet Storm',
    icon: 'spell_mage_cometstorm',
  },
  GLACIAL_SPIKE_DAMAGE: {
    id: 228600,
    name: 'Glacial Spike',
    icon: 'spell_frost_frostbolt',
  },
  RING_OF_FROST_DAMAGE: {
    id: 82691,
    name: 'Ring of Frost',
    icon: 'spell_frost_ringoffrost',
  },
  FREEZING_RAIN_BUFF: {
    id: 240555,
    name: 'Freezing Rain',
    icon: 'spell_frost_icestorm',
  },
  BONE_CHILLING_BUFF: {
    id: 205766,
    name: 'Bone Chilling',
    icon: 'ability_mage_chilledtothebone',
  },
  COLD_FRONT_BUFF: {
    id: 327327,
    name: 'Cold Front',
    icon: 'ability_mage_coldasice',
  },

  //Fire
  FIREBALL: {
    id: 133,
    name: 'Fireball',
    icon: 'spell_fire_flamebolt',
  },
  PYROBLAST: {
    id: 11366,
    name: 'Pyroblast',
    icon: 'spell_fire_fireball02',
  },
  FIRE_BLAST: {
    id: 108853,
    name: 'Fire Blast',
    icon: 'spell_fire_fireball',
  },
  PHOENIX_FLAMES: {
    id: 257541,
    name: 'Phoenix Flames',
    icon: 'artifactability_firemage_phoenixbolt',
  },
  HEATING_UP: {
    id: 48107,
    name: 'Heating Up',
    icon: 'ability_mage_hotstreak',
  },
  HOT_STREAK: {
    id: 48108,
    name: 'Hot Streak',
    icon: 'ability_mage_hotstreak',
  },
  COMBUSTION: {
    id: 190319,
    name: 'Combustion',
    icon: 'spell_fire_sealoffire',
  },
  CAUTERIZE: {
    id: 108843,
    name: 'Cauterize',
    icon: 'spell_fire_burningspeed',
  },
  ENHANCED_PYROTECHNICS: {
    id: 157644,
    name: 'Enhanced Pyrotechnics',
    icon: 'spell_fire_firebolt02',
  },
  FRENETIC_SPEED: {
    id: 236060,
    name: 'Frenetic Speed',
    icon: 'spell_fire_burningspeed',
  },
  BLAZING_BARRIER: {
    id: 235313,
    name: 'Blazing Barrier',
    icon: 'ability_mage_moltenarmor',
  },
  FLAMESTRIKE: {
    id: 2120,
    name: 'Flamestrike',
    icon: 'spell_fire_selfdestruct',
  },
  SCORCH: {
    id: 2948,
    name: 'Scorch',
    icon: 'spell_fire_soulburn',
  },
  DRAGONS_BREATH: {
    id: 31661,
    name: 'Dragon\'s Breath',
    icon: 'inv_misc_head_dragon_01',
  },
  METEOR_DAMAGE: {
    id: 153564,
    name: 'Meteor',
    icon: 'spell_mage_meteor',
  },
  PYROCLASM_BUFF: {
    id: 269651,
    name: 'Pyroclasm',
    icon: 'spell_shaman_lavasurge',
  },
  PHOENIX_FLAMES_DAMAGE: {
    id: 257542,
    name: 'Phoenix Flames',
    icon: 'artifactability_firemage_phoenixbolt',
  },
  FLAME_PATCH_DAMAGE: {
    id: 205472,
    name: 'Flame Patch',
    icon: 'spell_fire_selfdestruct',
  },
  IGNITE: {
    id: 12654,
    name: 'Ignite',
    icon: 'spell_fire_incinerate',
  },

  //Arcane
  ARCANE_BLAST: {
    id: 30451,
    name: 'Arcane Blast',
    icon: 'spell_arcane_blast',
  },
  ARCANE_MISSILES: {
    id: 5143,
    name: 'Arcane Missiles',
    icon: 'spell_nature_starfall',
  },
  ARCANE_BARRAGE: {
    id: 44425,
    name: 'Arcane Barrage',
    icon: 'ability_mage_arcanebarrage',
  },
  ARCANE_EXPLOSION: {
    id: 1449,
    name: 'Arcane Explosion',
    icon: 'spell_nature_wispsplode',
  },
  TOUCH_OF_THE_MAGI: {
    id: 321507,
    name: 'Touch of the Magi',
    icon: 'spell_mage_icenova',
  },
  TOUCH_OF_THE_MAGI_DEBUFF: {
    id: 210824,
    name: 'Touch of the Magi',
    icon: 'spell_mage_icenova',
  },
  ARCANE_POWER: {
    id: 12042,
    name: 'Arcane Power',
    icon: 'spell_nature_lightning',
  },
  ARCANE_MISSILES_BUFF: {
    id: 79683,
    name: 'Arcane Missiles!',
    icon: 'spell_nature_starfall',
  },
  ARCANE_MISSILES_ENERGIZE: {
    id: 208030,
    name: 'Arcane Missiles',
    icon: 'spell_nature_starfall',
  },
  ARCANE_FAMILIAR_BUFF: {
    id: 210126,
    name: 'Arcane Familiar',
    icon: 'ability_sorcererking_arcanemines',
  },
  CLEARCASTING_ARCANE: {
    id: 263725,
    name: 'Clearcasting',
    icon: 'spell_shadow_manaburn',
  },
  RULE_OF_THREES_BUFF: {
    id: 264774,
    name: 'Rule of Threes',
    icon: 'spell_arcane_starfire',
  },
  EVOCATION: {
    id: 12051,
    name: 'Evocation',
    icon: 'spell_nature_purge',
  },
  GREATER_INVISIBILITY: {
    id: 110959,
    name: 'Greater Invisibility',
    icon: 'ability_mage_greaterinvisibility',
  },
  GREATER_INVISIBILITY_BUFF: {
    id: 110960,
    name: 'Greater Invisibility',
    icon: 'ability_mage_greaterinvisibility',
  },
  MASTERY_SAVANT: {
    id: 190740,
    name: 'Mastery: Savant',
    icon: 'spell_arcane_manatap',
  },
  PRESENCE_OF_MIND: {
    id: 205025,
    name: 'Presence of Mind',
    icon: 'spell_nature_enchantarmor',
  },
  PRISMATIC_BARRIER: {
    id: 235450,
    name: 'Prismatic Barrier',
    icon: 'spell_magearmor',
  },
  CONJURE_MANA_GEM: {
    id: 759,
    name: 'Conjure Mana Gem',
    icon: 'inv_misc_gem_sapphire_02',
  },
  REPLENISH_MANA: {
    id: 5405,
    name: 'Replenish Mana',
    icon: 'inv_misc_gem_sapphire_02',
  },
  ARCANE_CHARGE: {
    id: 36032,
    name: 'Arcane Charge',
    icon: 'spell_arcane_arcane01',
  },
  SLOW: {
    id: 31589,
    name: 'Slow',
    icon: 'spell_nature_slow',
  },
  ARCANE_ORB_DAMAGE: {
    id: 153640,
    name: 'Arcane Orb',
    icon: 'spell_mage_arcaneorb',
  },
} as const;
export default spells;
