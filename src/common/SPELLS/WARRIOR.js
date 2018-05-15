/**
 * All Warrior abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Arms:
  // Rotational Spells
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
  SHATTERED_DEFENSES: {
    id: 248625,
    name: 'Shattered Defenses',
    icon: 'warrior_talent_icon_igniteweapon',
  },
  MORTAL_STRIKE: {
    id: 12294,
    name: 'Mortal Strike',
    icon: 'ability_warrior_savageblow',
  },
  EXECUTE: {
    id: 163201,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  EXECUTIONERS_PRECISION: {
    id: 242188,
    name: 'Executioner\'s Precision',
    icon: 'inv_sword_48',
  },
  SLAM: {
    id: 1464,
    name: 'Slam',
    icon: 'ability_warrior_decisivestrike',
  },
  CLEAVE: {
    id: 845,
    name: 'Cleave',
    icon: 'ability_warrior_cleave',
  },
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
  WARBREAKER: {
    id: 209577,
    name: 'Warbreaker',
    icon: 'inv_sword_2h_artifactarathor_d_01',
  },
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
  RAVAGER_DAMAGE: {
    id: 156287,
    name: 'Ravager',
    icon: 'warrior_talent_icon_ravager',
  },
  // Utility
  CHARGE: {
    id: 100,
    name: 'Charge',
    icon: 'ability_warrior_charge',
  },
  CHARGE_DAMAGE: {
    id: 126664,
    name: 'Charge',
    icon: 'ability_warrior_charge',
  },
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
  HAMSTRING: {
    id: 1715,
    name: 'Hamstring',
    icon: 'ability_shockwave',
  },
  DIE_BY_THE_SWORD: {
    id: 118038,
    name: 'Die by the Sword',
    icon: 'ability_warrior_challange',
  },
  // Passives
  CORRUPTED_BLOOD_OF_ZAKAJZ: {
    id: 209569,
    name: 'Corrupted Blood of Zakajz',
    icon: 'inv_artifact_corruptedbloodofzakajz',
  },
  OPPORTUNITY_STRIKES: {
    id: 203178,
    name: 'Opportunity Strikes',
    icon: 'ability_backstab',
  },
  SOUL_OF_THE_SLAUGHTER: {
    id: 240432,
    name: 'Soul of the Slaughter',
    icon: 'ability_rogue_slaughterfromtheshadows',
  },
  SWEEPING_STRIKES_EXECUTE: {
    id: 224253,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  TACTICIAN: {
    id: 199854,
    name: 'Tactician',
    icon: 'ability_warrior_unrelentingassault',
  },
  TRAUMA: {
    id: 215537,
    name: 'Trauma',
    icon: 'ability_warrior_trauma',
  },
  TOUCH_OF_ZAKAJZ: {
    id: 209933,
    name: 'Touch of Zakajz',
    icon: 'ability_warrior_colossussmash',
  },
  // Talents
  IN_FOR_THE_KILL_TALENT_BUFF: {
    id: 248622,
    name: "In For The Kill",
    icon: "ability_blackhand_marked4death",
  },

  // Arms Tier Sets
  // T21 2P Set Bonus
  WARRIOR_ARMS_T21_2P_BONUS: {
    id: 251878,
    name: 'Tier 21 2P Bonus',
    icon: 'ability_warrior_colossussmash',
  },
  WAR_VETERAN: {
    id: 253382,
    name: 'War Veteran',
    icon: 'ability_warrior_colossussmash',
  },
  // T21 4P Set Bonus
  WEIGHTED_BLADES: {
    id: 253383,
    name: 'Weighted Blades',
    icon: 'ability_warrior_stalwartprotector',
  },

  // Fury:
  //Rotational Spells
  BLOODTHIRST: {
    id: 23881,
    name: 'Bloodthirst',
    icon: 'spell_nature_bloodlust',
  },
  EXECUTE_FURY: {
    id: 5308,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  FURIOUS_SLASH: {
    id: 100130,
    name: 'Furious Slash',
    icon: 'ability_warrior_weaponmastery',
  },
  ODYNS_FURY: {
    id: 205545,
    name: 'Odyn\'s Fury',
    icon: 'inv_sword_1h_artifactvigfus_d_01',
  },
  RAGING_BLOW: {
    id: 85288,
    name: 'Raging Blow',
    icon: 'warrior_wild_strike',
  },
  RAMPAGE: {
    id: 184367,
    name: 'Rampage',
    icon: 'ability_warrior_rampage',
  },
  RAMPAGE_1: {
    id: 218617,
    name: 'Rampage',
    icon: 'ability_ironmaidens_bladerush',
  },
  RAMPAGE_2: {
    id: 184707,
    name: 'Rampage',
    icon: 'ability_ironmaidens_bladerush',
  },
  RAMPAGE_3: {
    id: 184709,
    name: 'Rampage',
    icon: 'ability_ironmaidens_bladerush',
  },
  RAMPAGE_4: {
    id: 201364,
    name: 'Rampage',
    icon: 'ability_ironmaidens_bladerush',
  },
  RAMPAGE_5: {
    id: 201363,
    name: 'Rampage',
    icon: 'ability_ironmaidens_bladerush',
  },
  WHIRLWIND_FURY: {
    id: 190411,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  //Mitigation Spells
  ENRAGED_REGENERATION: {
    id: 184364,
    name: 'Enraged Regeneration',
    icon: 'ability_warrior_focusedrage',
  },
  //Utility Spells
  PIERCING_HOWL: {
    id: 12323,
    name: 'Piercing Howl',
    icon: 'spell_shadow_deathscream',
  },
  HEROIC_LEAP_FURY: {
    id: 52174,
    name: 'Heroic Leap',
    icon: 'ability_heroicleap',
  },
  //Buffs
  ENRAGE: {
    id: 184362,
    name: 'Enrage',
    icon: 'spell_shadow_unholyfrenzy',
  },
  FROTHING_BERSERKER: {
    id: 215572,
    name: 'Frothing Berserker',
    icon: 'warrior_talent_icon_furyintheblood',
  },
  JUGGERNAUT: {
    id: 201009,
    name: 'Juggernaut',
    icon: 'warrior_talent_icon_skirmisher',
  },
  MASSACRE: {
    id: 206316,
    name: 'Massacre',
    icon: 'inv_sword_48',
  },

  // Fury tier sets
  WARRIOR_FURY_T19_2P_BONUS: {
    id: 212157,
    name: 'T19 2P Bonus',
    icon: 'trade_engineering',
  },
  WARRIOR_FURY_T19_4P_BONUS: {
    id: 212158,
    name: 'T19 4P Bonus',
    icon: 'trade_engineering',
  },
  WARRIOR_FURY_T20_2P_BONUS: {
    id: 242299,
    name: 'T20 2P Bonus',
    icon: 'ability_warrior_innerrage',
  },
  WARRIOR_FURY_T20_2P_BONUS_BUFF: {
    id: 242300,
    name: 'T20 2P Bonus',
    icon: 'warrior_wild_strike',
  },
  WARRIOR_FURY_T20_4P_BONUS: {
    id: 242301,
    name: 'T20 4P Bonus',
    icon: 'ability_warrior_innerrage',
  },
  WARRIOR_FURY_T21_2P_BONUS: {
    id: 251880,
    name: 'T21 2P Bonus',
    icon: 'spell_nature_reincarnation',
  },
  WARRIOR_FURY_T21_2P_BONUS_DEBUFF: {
    id: 253384,
    name: 'T21 2P Bonus',
    icon: 'ability_warrior_weaponmastery',
  },
  WARRIOR_FURY_T21_4P_BONUS: {
    id: 251881,
    name: 'T21 4P Bonus',
    icon: 'spell_nature_reincarnation',
  },
  WARRIOR_FURY_T21_4P_BONUS_BUFF: {
    id: 253385,
    name: 'T21 4P Bonus',
    icon: 'ability_warrior_rampage',
  },

  // Protection:
  //Rotational Spells
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
  SHIELD_SLAM: {
    id: 23922,
    name: 'Shield Slam',
    icon: 'inv_shield_05',
  },
  THUNDER_CLAP: {
    id: 6343,
    name: 'Thunder Clap',
    icon: 'spell_nature_thunderclap',
  },
  //Mitigation Spells
  IGNORE_PAIN: {
    id: 190456,
    name: 'Ignore Pain',
    icon: 'ability_warrior_renewedvigor',
  },
  RENEWED_FURY_TALENT_BUFF: {
    id: 202289,
    name: 'Renewed Fury',
    icon: 'ability_warrior_intensifyrage',
  },
  NELTHARIONS_FURY: {
    id: 203526,
    name: 'Neltharion\'s Fury',
    icon: 'warrior_talent_icon_furyintheblood',
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
  SPELL_REFLECTION: {
    id: 23920,
    name: 'Spell Reflection',
    icon: 'ability_warrior_shieldreflection',
  },
  //Utility Spells
  HEROIC_LEAP: {
    id: 6544,
    name: 'Heroic Leap',
    icon: 'ability_heroicleap',
  },
  HEROIC_THROW: {
    id: 57755,
    name: 'Heroic Throw',
    icon: 'inv_axe_66',
  },
  INTERCEPT: {
    id: 198304,
    name: 'Intercept',
    icon: 'ability_warrior_victoryrush',
  },
  TAUNT: {
    id: 355,
    name: 'Taunt',
    icon: 'spell_nature_reincarnation',
  },
  //Passives
  DEEP_WOUNDS: {
    id: 115767,
    name: 'Deep Wounds',
    icon: 'ability_backstab',
  },
  //Relics
  // Protection Tier Sets
  // T21 2P Set Bonus
  PROTECTION_WARRIOR_T21_2P_BONUS: {
    id: 251882,
    name: 'T21 2P Bonus',
    icon: 'spell_nature_reincarnation',
  },
  PROTECTION_WARRIOR_T21_2P_WALL_OF_IRON: {
    id: 253428,
    name: 'Wall of Iron',
    icon: 'ability_warrior_defensivestance',
  },

  // T20 2P Set Bonus
  PROTECTION_WARRIOR_T20_2P_BONUS: {
    id: 242302,
    name: 'T20 2P Bonus',
    icon: 'ability_warrior_defensivestance',
  },

  //Traits
  INTOLERANCE_TRAIT: {
    id: 203227,
    name: 'Intolerance',
    icon: 'warrior_talent_icon_furyintheblood',
  },

  // Shared:
  BATTLE_CRY: {
    id: 1719,
    name: 'Battle Cry',
    icon: 'warrior_talent_icon_innerrage',
  },
  BERSERKER_RAGE: {
    id: 18499,
    name: 'Berserker Rage',
    icon: 'spell_nature_ancestralguardian',
  },
  PUMMEL: {
    id: 6552,
    name: 'Pummel',
    icon: 'inv_gauntlets_04',
  },
  VICTORY_RUSH: {
    id: 34428,
    name: 'Victory Rush',
    icon: 'ability_warrior_devastate',
  },
  COMMANDING_SHOUT: {
    id: 97462,
    name: 'Commanding Shout',
    icon: 'ability_warrior_rallyingcry',
  },
  INTIMIDATING_SHOUT: {
    id: 5246,
    name: 'Intimidating Shout',
    icon: 'ability_golemthunderclap',
  },
};
