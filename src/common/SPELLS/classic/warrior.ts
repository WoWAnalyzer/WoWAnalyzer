import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------

  BATTLE_SHOUT: {
    id: 47436,
    name: 'Battle Shout',
    icon: 'ability_warrior_battleshout',
    lowRanks: [2048, 25289, 11551, 11550, 11549, 6192, 5242, 6673],
  },
  BATTLE_STANCE: {
    id: 2457,
    name: 'Battle Stance',
    icon: 'ability_warrior_offensivestance',
  },
  BERSERKER_RAGE: {
    id: 18499,
    name: 'Berserker Rage',
    icon: 'spell_nature_ancestralguardian',
  },
  BERSERKER_STANCE: {
    id: 2458,
    name: 'Berserker Stance',
    icon: 'ability_racial_avatar',
  },
  BLOODRAGE: {
    id: 2687,
    name: 'Blood Rage',
    icon: 'ability_racial_bloodrage',
  },
  CHALLENGING_SHOUT: {
    id: 1161,
    name: 'Challenging Shout',
    icon: 'ability_bullrush',
  },
  CHARGE: {
    id: 100,
    name: 'Charge',
    icon: 'ability_warrior_charge',
  },
  CLEAVE: {
    id: 845,
    name: 'Cleave',
    icon: 'ability_warrior_cleave',
  },
  COMMANDING_SHOUT: {
    id: 47440,
    name: 'Commanding Shout',
    icon: 'ability_warrior_rallyingcry',
    lowRanks: [47439, 469],
  },
  DEFENSIVE_STANCE: {
    id: 71,
    name: 'Defensive Stance',
    icon: 'ability_warrior_defensivestance',
  },
  DEMORALIZING_SHOUT: {
    id: 47437,
    name: 'Demoralizing Shout',
    icon: 'ability_warrior_warcry',
    lowRanks: [47519, 25231, 20569, 11609, 11608, 7369, 845],
  },
  DISARM: {
    id: 676,
    name: 'Disarm',
    icon: 'ability_warrior_disarm',
  },
  ENRAGED_REGENERATION: {
    id: 55694,
    name: 'Enraged Regeneration',
    icon: 'ability_warrior_focusedrage',
  },
  EXECUTE: {
    id: 5308,
    name: 'Execute',
    icon: 'inv_sword_48',
  },
  HAMSTRING: {
    id: 1715,
    name: 'Hamstring',
    icon: 'ability_shockwave',
  },
  HEROIC_STRIKE: {
    id: 78,
    name: 'Heroic Strike',
    icon: 'ability_rogue_ambush',
  },
  HEROIC_THROW: {
    id: 57550,
    name: 'Heroic Throw',
    icon: 'inv_axe_66',
  },
  INTERCEPT: {
    id: 20252,
    name: 'Intercept',
    icon: 'ability_rogue_sprint',
  },
  INTERVENE: {
    id: 3411,
    name: 'Intervene',
    icon: 'ability_warrior_victoryrush',
  },
  INTIMIDATING_SHOUT: {
    id: 5246,
    name: 'Intimidating Shout',
    icon: 'ability_golemthunderclap',
  },
  MOCKING_BLOW: {
    id: 694,
    name: 'Mocking Blow',
    icon: 'ability_warrior_punishingblow',
  },
  OVERPOWER: {
    id: 7384,
    name: 'Overpower',
    icon: 'ability_meleedamage',
  },
  TASTE_FOR_BLOOD: {
    id: 60503,
    name: 'Taste for Blood',
    icon: 'ability_rogue_hungerforblood.jpg',
  },
  PUMMEL: {
    id: 6552,
    name: 'Pummel',
    icon: 'inv_gauntlets_04',
  },
  RECKLESSNESS: {
    id: 1719,
    name: 'Recklessness',
    icon: 'ability_criticalstrike',
  },
  REND: {
    id: 772,
    name: 'Rend',
    icon: 'ability_gouge',
  },
  RETALIATION: {
    id: 20230,
    name: 'Retaliation',
    icon: 'ability_warrior_challange',
  },
  REVENGE: {
    id: 57823,
    name: 'Revenge',
    icon: 'ability_warrior_revenge',
    lowRanks: [47470, 25236, 25234, 20662, 20661, 20660, 20658, 5308],
  },
  SHATTERING_THROW: {
    id: 64382,
    name: 'Shattering Throw',
    icon: 'ability_warrior_shatteringthrow',
  },
  SHIELD_BASH: {
    id: 72,
    name: 'Shield Bash',
    icon: 'ability_warrior_shieldbash',
  },
  SHIELD_BLOCK: {
    id: 2565,
    name: 'Shield Block',
    icon: 'ability_defend',
  },
  SHIELD_SLAM: {
    id: 47488,
    name: 'Shield Slam',
    icon: 'inv_shield_05',
    lowRanks: [47487, 30356, 25258, 23925, 23924, 23923, 23922],
  },
  SHIELD_WALL: {
    id: 871,
    name: 'Shield Wall',
    icon: 'ability_warrior_shieldwall',
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
  SUNDER_ARMOR: {
    id: 7386,
    name: 'Sunder Armor',
    icon: 'ability_warrior_sunder',
  },
  TAUNT: {
    id: 355,
    name: 'Taunt',
    icon: 'spell_nature_reincarnation',
  },
  THUNDER_CLAP: {
    id: 47502,
    name: 'Thunder Clap',
    icon: 'spell_nature_thunderclap',
    lowRanks: [47501, 25264, 11581, 11580, 8205, 8204, 8198, 6343],
  },
  VICTORY_RUSH: {
    id: 34428,
    name: 'Victory Rush',
    icon: 'ability_warrior_devastate',
  },
  WHIRLWIND: {
    id: 1680,
    name: 'Whirlwind',
    icon: 'ability_whirlwind',
  },
  // Talents
  BLOODTHIRST: {
    id: 23881,
    name: 'Bloodthirst',
    icon: 'spell_nature_bloodlust',
  },
  BLOODSURGE: {
    id: 46915,
    name: 'Bloodsurge',
    icon: 'ability_warrior_bloodsurge',
    lowRanks: [46914, 46913],
  },
  SLAM_PROC: {
    id: 46916,
    name: 'Slam',
    icon: 'ability_warrior_bloodsurge',
  },
  DEEP_WOUNDS: {
    id: 12867,
    name: 'Deep Wounds',
    icon: 'ability_backstab',
    lowRanks: [12849, 12834],
  },
  FLURRY: {
    id: 12974,
    name: 'Flurry',
    icon: 'ability_ghoulfrenzy',
    lowRanks: [12319, 12971, 12972, 12973],
  },
  SHOCKWAVE: {
    id: 46968,
    name: 'Shockwave',
    icon: 'ability_warrior_shockwave',
  },
  LAST_STAND: {
    id: 12975,
    name: 'Last Stand',
    icon: 'spell_holy_ashestoashes',
  },
  BLADESTORM: {
    id: 46924,
    name: 'Bladestorm',
    icon: 'ability_warrior_bladestorm',
  },
  MORTAL_STRIKE: {
    id: 12294,
    name: 'Mortal Strike',
    icon: 'ability_warrior_savageblow',
  },
  DEATH_WISH: {
    id: 12292,
    name: 'Death Wish',
    icon: 'spell_shadow_deathpact',
  },
  SWEEPING_STRIKES: {
    id: 12328,
    name: 'Sweeping Strikes',
    icon: 'ability_rogue_slicedice',
  },
  DEVASTATE: {
    id: 47498,
    name: 'Devastate',
    icon: 'inv_sword_11',
  },
  PIERCING_HOWL: {
    id: 12323,
    name: 'Piercing Howl',
    icon: 'spell_shadow_deathscream',
  },
  HEROIC_FURY: {
    id: 60970,
    name: 'Heroic Fury',
    icon: 'ability_heroicleap',
  },
  CONCUSSION_BLOW: {
    id: 12809,
    name: 'Concussion Blow',
    icon: 'ability_thunderbolt',
  },
  VIGILANCE: {
    id: 50720,
    name: 'Vigilance',
    icon: 'ability_warrior_vigilance',
  },
  COLOSSUS_SMASH: { id: 86346, name: 'Colossus Smash', icon: 'ability_warrior_colossussmash.jpg' },
  SUDDEN_DEATH: {
    id: 52437,
    name: 'Sudden Death',
    icon: 'ability_warrior_improveddisciplines.jpg',
  },
  DEADLY_CALM: { id: 85730, name: 'Deadly Calm', icon: 'achievement_boss_kingymiron.jpg' },
  RALLYING_CRY: { id: 97462, name: 'Rallying Cry', icon: 'ability_warrior_rallyingcry.jpg' },
  // note: wowhead thinks this is an npc spell but this is what the actual Heroic Leap spell logs as
  HEROIC_LEAP: { id: 52174, name: 'Heroic Leap', icon: 'ability_heroicleap.jpg' },
  INNER_RAGE: { id: 1134, name: 'Inner Rage', icon: 'warrior_talent_icon_innerrage.jpg' },
  BLADESTORM_TRIGGERED_SPELL: {
    id: 50622,
    name: 'Whirlwind',
    icon: 'ability_warrior_bladestorm.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
