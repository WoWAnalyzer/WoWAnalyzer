import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------

  BATTLE_SHOUT: {
    id: 47436,
    name: 'Battle Shout',
    icon: 'ability_warrior_battleshout.jpg',
  },
  BATTLE_STANCE: {
    id: 2457,
    name: 'Battle Stance',
    icon: 'ability_warrior_offensivestance.jpg',
  },
  BERSERKER_RAGE: {
    id: 18499,
    name: 'Berserker Rage',
    icon: 'spell_nature_ancestralguardian.jpg',
  },
  BERSERKER_STANCE: {
    id: 2458,
    name: 'Berserker Stance',
    icon: 'ability_racial_avatar.jpg',
  },
  BLOODRAGE: {
    id: 2687,
    name: 'Blood Rage',
    icon: 'ability_racial_bloodrage.jpg',
  },
  CHALLENGING_SHOUT: {
    id: 1161,
    name: 'Challenging Shout',
    icon: 'ability_bullrush.jpg',
  },
  CHARGE: {
    id: 100,
    name: 'Charge',
    icon: 'ability_warrior_charge.jpg',
  },
  CLEAVE: {
    id: 845,
    name: 'Cleave',
    icon: 'ability_warrior_cleave.jpg',
  },
  DEFENSIVE_STANCE: {
    id: 71,
    name: 'Defensive Stance',
    icon: 'ability_warrior_defensivestance.jpg',
  },
  DEMORALIZING_SHOUT: {
    id: 47437,
    name: 'Demoralizing Shout',
    icon: 'ability_warrior_warcry.jpg',
  },
  DISARM: {
    id: 676,
    name: 'Disarm',
    icon: 'ability_warrior_disarm.jpg',
  },
  ENRAGED_REGENERATION: {
    id: 55694,
    name: 'Enraged Regeneration',
    icon: 'ability_warrior_focusedrage.jpg',
  },
  EXECUTE: {
    id: 5308,
    name: 'Execute',
    icon: 'inv_sword_48.jpg',
  },
  HAMSTRING: {
    id: 1715,
    name: 'Hamstring',
    icon: 'ability_shockwave.jpg',
  },
  HEROIC_STRIKE: {
    id: 78,
    name: 'Heroic Strike',
    icon: 'ability_rogue_ambush.jpg',
  },
  HEROIC_THROW: {
    id: 57550,
    name: 'Heroic Throw',
    icon: 'inv_axe_66.jpg',
  },
  INTERCEPT: {
    id: 20252,
    name: 'Intercept',
    icon: 'ability_rogue_sprint.jpg',
  },
  INTERVENE: {
    id: 3411,
    name: 'Intervene',
    icon: 'ability_warrior_victoryrush.jpg',
  },
  INTIMIDATING_SHOUT: {
    id: 5246,
    name: 'Intimidating Shout',
    icon: 'ability_golemthunderclap.jpg',
  },
  MOCKING_BLOW: {
    id: 694,
    name: 'Mocking Blow',
    icon: 'ability_warrior_punishingblow.jpg',
  },
  OVERPOWER: {
    id: 7384,
    name: 'Overpower',
    icon: 'ability_meleedamage.jpg',
  },
  TASTE_FOR_BLOOD: {
    id: 60503,
    name: 'Taste for Blood',
    icon: 'ability_rogue_hungerforblood.jpg.jpg',
  },
  PUMMEL: {
    id: 6552,
    name: 'Pummel',
    icon: 'inv_gauntlets_04.jpg',
  },
  RECKLESSNESS: {
    id: 1719,
    name: 'Recklessness',
    icon: 'ability_criticalstrike.jpg',
  },
  REND: {
    id: 772,
    name: 'Rend',
    icon: 'ability_gouge.jpg',
  },
  RETALIATION: {
    id: 20230,
    name: 'Retaliation',
    icon: 'ability_warrior_challange.jpg',
  },
  REVENGE: {
    id: 57823,
    name: 'Revenge',
    icon: 'ability_warrior_revenge.jpg',
  },
  SHATTERING_THROW: {
    id: 64382,
    name: 'Shattering Throw',
    icon: 'ability_warrior_shatteringthrow.jpg',
  },
  SHIELD_BASH: {
    id: 72,
    name: 'Shield Bash',
    icon: 'ability_warrior_shieldbash.jpg',
  },
  SHIELD_BLOCK: {
    id: 2565,
    name: 'Shield Block',
    icon: 'ability_defend.jpg',
  },
  SHIELD_SLAM: {
    id: 47488,
    name: 'Shield Slam',
    icon: 'inv_shield_05.jpg',
  },
  SHIELD_WALL: {
    id: 871,
    name: 'Shield Wall',
    icon: 'ability_warrior_shieldwall.jpg',
  },
  SLAM: {
    id: 1464,
    name: 'Slam',
    icon: 'ability_warrior_decisivestrike.jpg',
  },
  SPELL_REFLECTION: {
    id: 23920,
    name: 'Spell Reflection',
    icon: 'ability_warrior_shieldreflection.jpg',
  },
  SUNDER_ARMOR: {
    id: 7386,
    name: 'Sunder Armor',
    icon: 'ability_warrior_sunder.jpg',
  },
  TAUNT: {
    id: 355,
    name: 'Taunt',
    icon: 'spell_nature_reincarnation.jpg',
  },
  THUNDER_CLAP: {
    id: 47502,
    name: 'Thunder Clap',
    icon: 'spell_nature_thunderclap.jpg',
  },
  VICTORY_RUSH: {
    id: 34428,
    name: 'Victory Rush',
    icon: 'ability_warrior_devastate.jpg',
  },
  WHIRLWIND: {
    id: 1680,
    name: 'Whirlwind',
    icon: 'ability_whirlwind.jpg',
  },
  // Talents
  BLOODTHIRST: {
    id: 23881,
    name: 'Bloodthirst',
    icon: 'spell_nature_bloodlust.jpg',
  },
  BLOODSURGE: {
    id: 46915,
    name: 'Bloodsurge',
    icon: 'ability_warrior_bloodsurge.jpg',
  },
  SLAM_PROC: {
    id: 46916,
    name: 'Slam',
    icon: 'ability_warrior_bloodsurge.jpg',
  },
  DEEP_WOUNDS: {
    id: 12867,
    name: 'Deep Wounds',
    icon: 'ability_backstab.jpg',
  },
  FLURRY: {
    id: 12974,
    name: 'Flurry',
    icon: 'ability_ghoulfrenzy.jpg',
  },
  SHOCKWAVE: {
    id: 46968,
    name: 'Shockwave',
    icon: 'ability_warrior_shockwave.jpg',
  },
  LAST_STAND: {
    id: 12975,
    name: 'Last Stand',
    icon: 'spell_holy_ashestoashes.jpg',
  },
  BLADESTORM: {
    id: 46924,
    name: 'Bladestorm',
    icon: 'ability_warrior_bladestorm.jpg',
  },
  MORTAL_STRIKE: {
    id: 12294,
    name: 'Mortal Strike',
    icon: 'ability_warrior_savageblow.jpg',
  },
  DEATH_WISH: {
    id: 12292,
    name: 'Death Wish',
    icon: 'spell_shadow_deathpact.jpg',
  },
  SWEEPING_STRIKES: {
    id: 12328,
    name: 'Sweeping Strikes',
    icon: 'ability_rogue_slicedice.jpg',
  },
  DEVASTATE: {
    id: 47498,
    name: 'Devastate',
    icon: 'inv_sword_11.jpg',
  },
  PIERCING_HOWL: {
    id: 12323,
    name: 'Piercing Howl',
    icon: 'spell_shadow_deathscream.jpg',
  },
  HEROIC_FURY: {
    id: 60970,
    name: 'Heroic Fury',
    icon: 'ability_heroicleap.jpg',
  },
  CONCUSSION_BLOW: {
    id: 12809,
    name: 'Concussion Blow',
    icon: 'ability_thunderbolt.jpg',
  },
  VIGILANCE: {
    id: 50720,
    name: 'Vigilance',
    icon: 'ability_warrior_vigilance.jpg',
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
