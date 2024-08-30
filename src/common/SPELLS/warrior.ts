/**
 * All Warrior abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
import Spell from 'common/SPELLS/Spell';

const spells = {
  // Shared:
  BATTLE_SHOUT: {
    id: 6673,
    name: 'Battle Shout',
    icon: 'ability_warrior_battleshout',
  },
  BERSERKER_RAGE: {
    id: 18499,
    name: 'Berserker Rage',
    icon: 'spell_nature_ancestralguardian',
  },
  CHALLENGING_SHOUT: {
    id: 1161,
    name: 'Challenging Shout',
    icon: 'ability_bullrush',
  },
  // Utility
  CHARGE: {
    id: 100,
    name: 'Charge',
    icon: 'ability_warrior_charge',
  },
  CHARGE_2: {
    id: 126664,
    name: 'Charge',
    icon: 'ability_warrior_charge',
  },

  // have to double check
  CHARGE_SLOW: {
    id: 236027,
    name: 'Charge',
    icon: 'ability_rogue_trip',
  },
  CHARGE_ROOT: {
    id: 105771,
    name: 'Charge',
    icon: 'ability_warrior_charge',
  },
  // so execute is a mess... its all shared but its not
  // Arms/prot
  EXECUTE: {
    id: 163201,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  EXECUTE_GLYPHED: {
    id: 281000,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  EXECUTE_DAMAGE: {
    id: 260798,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  // Fury
  EXECUTE_FURY: {
    id: 5308,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  EXECUTE_FURY_MASSACRE: {
    id: 280735,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  EXECUTE_DAMAGE_FURY: {
    id: 280849,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  EXECUTE_DAMAGE_OH_FURY: {
    id: 163558,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  HAMSTRING: {
    id: 1715,
    name: 'Hamstring',
    icon: 'ability_shockwave',
  },
  HEROIC_LEAP: {
    id: 52174,
    name: 'Heroic Leap',
    icon: 'ability_heroicleap',
  },
  HEROIC_THROW: {
    id: 57755,
    name: 'Heroic Throw',
    icon: 'inv_axe_66',
  },
  IGNORE_PAIN: {
    id: 190456,
    name: 'Ignore Pain',
    icon: 'ability_warrior_renewedvigor',
  },
  INTERVENE_CAST: {
    id: 3411,
    name: 'Intervene',
    icon: 'ability_warrior_victoryrush',
  },
  INTERVENE_BUFF: {
    id: 147833,
    name: 'Intervene',
    icon: 'ability_warrior_victoryrush',
  },
  INTERVENE_CHARGE: {
    id: 316531,
    name: 'Intervene',
    icon: 'ability_warrior_victoryrush',
  },
  INTIMIDATING_SHOUT: {
    id: 5246,
    name: 'Intimidating Shout',
    icon: 'ability_golemthunderclap',
  },
  PUMMEL: {
    id: 6552,
    name: 'Pummel',
    icon: 'inv_gauntlets_04',
  },
  RALLYING_CRY: {
    id: 97462,
    name: 'Rallying Cry',
    icon: 'ability_warrior_rallyingcry',
  },
  RALLYING_CRY_BUFF: {
    id: 97463,
    name: 'Rallying Cry',
    icon: 'ability_warrior_rallyingcry',
  },
  SHATTERING_THROW: {
    id: 64382,
    name: 'Shattering Throw',
    icon: 'ability_warrior_shatteringthrow',
  },
  SHIELD_BLOCK: {
    id: 2565,
    name: 'Shield Block',
    icon: 'ability_defend',
  },
  SHIELD_BLOCK_BUFF: {
    id: 132404,
    name: 'Shield Block Buff',
    icon: 'ability_defend',
  },
  SHIELD_SLAM: {
    id: 23922,
    name: 'Shield Slam',
    icon: 'inv_shield_05',
  },
  SLAM: {
    id: 1464,
    name: 'Slam',
    icon: 'ability_warrior_decisivestrike',
  },
  SPELL_REFLECTION: {
    id: 23920,
    name: 'Spell Reflection',
    icon: 'ability_warrior_shieldreflection',
  },
  TAUNT: {
    id: 355,
    name: 'Taunt',
    icon: 'spell_nature_reincarnation',
  },
  VICTORY_RUSH: {
    id: 34428,
    name: 'Victory Rush',
    icon: 'ability_warrior_devastate',
  },
  // Shared but not really
  // Arms/prot
  WHIRLWIND: {
    id: 1680,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  WHIRLWIND_DAMAGE_1: {
    id: 199658,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  WHIRLWIND_DAMAGE_2_3: {
    id: 199850,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  // Fury
  WHIRLWIND_FURY_CAST: {
    id: 190411,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  WHIRLWIND_FURY_ENERGIZE: {
    id: 280715,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  WHIRLWIND_FURY_DAMAGE_MH: {
    id: 199667,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  WHIRLWIND_FURY_DAMAGE_OH: {
    id: 44949,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  // ??? nobody can tell me why but these are in log
  WHIRLWIND_FURY_DAMAGE_OTHER_MH: {
    id: 199852,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  WHIRLWIND_FURY_DAMAGE_OTHER_OH: {
    id: 199851,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  // The cleave buff of whirlwind
  WHIRLWIND_BUFF: {
    id: 85739,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  ONSLAUGHT: {
    id: 315720,
    name: 'Onslaught',
    icon: 'ability_warrior_trauma',
  },

  // Arms/Fury:
  PIERCING_HOWL: {
    id: 12323,
    name: 'Piercing Howl',
    icon: 'spell_shadow_deathscream',
  },

  // Arms/Prot
  RAVAGER_DAMAGE: {
    id: 156287,
    name: 'Ravager',
    icon: 'warrior_talent_icon_ravager',
  },
  RAVAGER_ENERGIZE: {
    id: 334934,
    name: 'Ravager',
    icon: 'warrior_talent_icon_ravager',
  },

  // Shared Talent buffs
  BOUNDING_STRIDE_BUFF: {
    id: 202164,
    name: 'Bounding Stride',
    icon: 'ability_heroicleap',
  },
  WAR_MACHINE_TALENT_BUFF: {
    id: 262232,
    name: 'War Machine',
    icon: 'ability_hunter_rapidkilling',
  },
  STORM_BOLT_TALENT_DEBUFF: {
    id: 132169,
    name: 'Storm Bolt',
    icon: 'warrior_talent_icon_stormbolt',
  },
  IMPENDING_VICTORY_TALENT_HEAL: {
    id: 202166,
    name: 'Impending Victory',
    icon: 'spell_impending_victory',
  },
  IMPENDING_VICTORY: {
    id: 202168,
    name: 'Impending Victory',
    icon: 'spell_impending_victory',
  },
  CHAMPIONS_SPEAR: {
    id: 376079,
    name: "Champion's Spear",
    icon: 'ability_bastion_warrior',
  },
  CHAMPIONS_SPEAR_DAMAGE: {
    id: 376080,
    name: "Champion's Spear",
    icon: 'ability_bastion_warrior',
  },
  CHAMPIONS_MIGHT: {
    id: 386286,
    name: "Champion's Might",
    icon: 'ability_bastion_warrior',
  },
  WILD_STRIKES: {
    id: 392778,
    name: 'Wild Strikes',
    icon: 'ability_ghoulfrenzy',
  },
  AVATAR_SHARED: {
    id: 107574,
    name: 'Avatar',
    icon: 'warrior_talent_icon_avatar',
  },
  AVATAR_PROTECTION: {
    id: 401150,
    name: 'Avatar',
    icon: 'warrior_talent_icon_avatar',
  },

  // Arms:
  BLADESTORM: {
    id: 227847,
    name: 'Bladestorm',
    icon: 'ability_warrior_bladestorm',
  },
  BLADESTORM_DAMAGE: {
    id: 50622,
    name: 'Bladestorm',
    icon: 'ability_warrior_bladestorm',
  },
  COLOSSUS_SMASH: {
    id: 167105,
    name: 'Colossus Smash',
    icon: 'ability_warrior_colossussmash',
  },
  COLOSSUS_SMASH_DEBUFF: {
    id: 208086,
    name: 'Colossus Smash',
    icon: 'ability_warrior_colossussmash',
  },
  DIE_BY_THE_SWORD: {
    id: 118038,
    name: 'Die by the Sword',
    icon: 'ability_warrior_challange',
  },
  MORTAL_STRIKE: {
    id: 12294,
    name: 'Mortal Strike',
    icon: 'ability_warrior_savageblow',
  },
  //this is mortal strike's debuff
  MORTAL_WOUNDS: {
    id: 115804,
    name: 'Mortal Wounds',
    icon: 'ability_criticalstrike',
  },
  OVERPOWER: {
    id: 7384,
    name: 'Overpower',
    icon: 'ability_meleedamage',
  },
  SEASONED_SOLDIER: {
    id: 279423,
    name: 'Seasoned Soldier',
    icon: 'inv_axe_09',
  },
  SWEEPING_STRIKES: {
    id: 260708,
    name: 'Sweeping Strikes',
    icon: 'ability_rogue_slicedice',
  },
  TACTICIAN: {
    id: 199854,
    name: 'Tactician',
    icon: 'ability_warrior_unrelentingassault',
  },
  MASTERY_DEEP_WOUNDS: {
    id: 262111,
    name: 'Mastery: Deep Wounds',
    icon: 'ability_backstab',
  },
  MASTERY_DEEP_WOUNDS_DEBUFF: {
    id: 262115,
    name: 'Deep Wounds',
    icon: 'ability_backstab',
  },

  // Arm Talents
  IN_FOR_THE_KILL_TALENT_BUFF: {
    id: 248622,
    name: 'In For The Kill',
    icon: 'ability_blackhand_marked4death',
  },
  SUDDEN_DEATH_ARMS_TALENT_BUFF: {
    id: 52437,
    name: 'Sudden Death',
    icon: 'abilty_warrior_improveddisciplines',
  },
  SECOND_WIND_TALENT_HEAL: {
    id: 202147,
    name: 'Second Wind',
    icon: 'ability_hunter_harass',
  },

  // Fury:
  BLOODTHIRST: {
    id: 23881,
    name: 'Bloodthirst',
    icon: 'spell_nature_bloodlust',
  },
  ENRAGED_REGENERATION: {
    id: 184364,
    name: 'Enraged Regeneration',
    icon: 'ability_warrior_focusedrage',
  },
  RAGING_BLOW: {
    id: 85288,
    name: 'Raging Blow',
    icon: 'warrior_wild_strike',
  },
  HACK_AND_SLASH: {
    id: 383873,
    name: 'Hack and Slash',
    icon: 'ability_warrior_savageblow',
  },
  WRATH_AND_FURY: {
    id: 392937,
    name: 'Wrath and Fury',
    icon: 'warrior_wild_strike',
  },
  RAMPAGE: {
    id: 184367,
    name: 'Rampage',
    icon: 'ability_warrior_rampage',
  },
  RAMPAGE_1: {
    id: 184707,
    name: 'Rampage',
    icon: 'ability_ironmaidens_bladerush',
  },
  RAMPAGE_2: {
    id: 184709,
    name: 'Rampage',
    icon: 'ability_ironmaidens_bladerush',
  },
  RAMPAGE_3: {
    id: 201364,
    name: 'Rampage',
    icon: 'ability_ironmaidens_bladerush',
  },
  RAMPAGE_4: {
    id: 201363,
    name: 'Rampage',
    icon: 'ability_ironmaidens_bladerush',
  },
  RECKLESSNESS: {
    id: 1719,
    name: 'Recklessness',
    icon: 'warrior_talent_icon_innerrage',
  },
  ENRAGE: {
    id: 184362,
    name: 'Enrage',
    icon: 'spell_shadow_unholyfrenzy',
  },

  // Talents
  WAR_MACHINE_FURY_TALENT_BUFF: {
    id: 280776,
    name: 'Sudden Death',
    icon: 'abilty_warrior_improveddisciplines',
  },
  BLADESTORM_OH_DAMAGE: {
    id: 95738,
    name: 'Bladestorm',
    icon: 'ability_warrior_bladestorm',
  },
  SIEGEBREAKER_DEBUFF: {
    id: 280773,
    name: 'Siegebreaker',
    icon: 'inv_make_101',
  },
  FROTHING_BERSERKER_REFUND: {
    id: 215572,
    name: 'Frothing Berserker',
    icon: 'warrior_talent_icon_furyintheblood',
  },
  // spell replacement for raging blow when using reckless abondon
  CRUSHING_BLOW: {
    id: 335097,
    name: 'Crushing Blow',
    icon: 'ability_hunter_swiftstrike',
  },
  // spell replacement for bloodthirst when using reckless abondon
  BLOODBATH: {
    id: 335096,
    name: 'Bloodbath',
    icon: 'ability_warrior_bloodbath',
  },
  ODYNS_FURY: {
    id: 385060,
    name: "Odyn's Fury",
    icon: 'inv_sword_1h_artifactvigfus_d_01',
  },
  ODYNS_FURY_1: {
    id: 385059,
    name: "Odyn's Fury",
    icon: 'inv_sword_1h_artifactvigfus_d_01',
  },
  ODYNS_FURY_2: {
    id: 385061,
    name: "Odyn's Fury",
    icon: 'inv_sword_1h_artifactvigfus_d_01',
  },
  ODYNS_FURY_3: {
    id: 385062,
    name: "Odyn's Fury",
    icon: 'inv_sword_1h_artifactvigfus_d_01',
  },
  FRENZY: {
    id: 335082,
    name: 'Frenzy',
    icon: 'ability_rogue_bloodyeye',
  },

  // Protection:
  DEVASTATE: {
    id: 20243,
    name: 'Devastate',
    icon: 'inv_sword_11',
  },
  REVENGE: {
    id: 6572,
    name: 'Revenge',
    icon: 'ability_warrior_revenge',
  },
  REVENGE_FREE_CAST: {
    id: 5302,
    name: 'Revenge!',
    icon: 'ability_warrior_revenge',
  },
  THUNDER_CLAP: {
    id: 6343,
    name: 'Thunder Clap',
    icon: 'spell_nature_thunderclap',
  },
  RAGE_DAMAGE_TAKEN: {
    id: 195707,
    name: 'Rage from melee hits taken',
    icon: 'ability_racial_avatar',
  },
  RAGE_AUTO_ATTACKS: {
    id: 198395, //could use a proper spellID for the tooltip
    name: 'Rage from auto attacks',
    icon: 'ability_racial_avatar',
  },
  //Mitigation Spells
  RENEWED_FURY_TALENT_BUFF: {
    id: 202289,
    name: 'Renewed Fury',
    icon: 'ability_warrior_intensifyrage',
  },
  INTO_THE_FRAY_BUFF: {
    id: 202602,
    name: 'Into the Fray',
    icon: 'ability_warrior_bloodfrenzy',
  },
  PUNISH_DEBUFF: {
    id: 275335,
    name: 'Punish',
    icon: 'ability_deathknight_sanguinfortitude',
  },
  DEVASTATOR_DAMAGE: {
    id: 236282,
    name: 'Devastator',
    icon: 'inv_sword_11',
  },
  //Cooldown Spells
  DEMORALIZING_SHOUT: {
    id: 1160,
    name: 'Demoralizing Shout',
    icon: 'ability_warrior_warcry',
  },
  LAST_STAND: {
    id: 12975,
    name: 'Last Stand',
    icon: 'spell_holy_ashestoashes',
  },
  SHIELD_WALL: {
    id: 871,
    name: 'Shield Wall',
    icon: 'ability_warrior_shieldwall',
  },
  UNNERVING_FOCUS_BUFF: {
    id: 384043,
    name: 'Unnerving Focus',
    icon: 'rogue_shadowfocus',
  },

  //Passives
  DEEP_WOUNDS: {
    id: 115767,
    name: 'Deep Wounds',
    icon: 'ability_backstab',
  },

  // Tier set
  VIOLENT_OUTBURST_BUFF: {
    id: 386478,
    name: 'Violent Outburst',
    icon: 'ability_warrior_furiousresolve',
  },
  EARTHEN_TANCITY: {
    id: 410218,
    name: 'Earthen Tenacity',
    icon: 'inv_misc_head_dragon_red',
  },
  EARTHEN_SMASH: {
    id: 410219,
    name: 'Earthen Smash',
    icon: 'inv_misc_head_dragon_red',
  },

  //Fatality talent is split into 3 IDs, the talent (703), and these two.
  FATAL_MARK_DEBUFF: {
    id: 383704,
    name: 'Fatal Mark',
    icon: 'achievement_bg_killingblow_berserker',
  },
  FATAL_MARK_DAMAGE: {
    id: 383706,
    name: 'Fatal Mark',
    icon: 'achievemnt_bg_killingblow_berserker',
  },
  REND_DOT_ARMS: {
    id: 388539,
    name: 'Rend',
    icon: 'ability_gouge',
  },

  //T29 Arms 4-set buff
  STRIKE_VULNERABILITIES_BUFF: {
    id: 394173,
    name: 'Strike Vulnerabilities',
    icon: 'ability_criticalstrike',
  },

  // Talent in here so SpellLink doesn't return Unknown
  IMPENETRABLE_WALL_TALENT: {
    id: 384072,
    name: 'Impenetrable Wall',
    icon: 'ability_warrior_shieldguard',
  },
} satisfies Record<string, Spell>;

export default spells;
