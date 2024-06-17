/**
 * All WotLK Death Knight spells (including talent spells) go here.
 * You need to do this manually by opening a WCL report and clicking the icons of spells to open the relevant Wowhead page. Here, you can get the icon name by clicking the icon, copy the name of the spell, and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS/classic` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell from '../Spell';

const spells = {
  // --------
  // SHARED
  // --------
  ANTI_MAGIC_SHELL: {
    id: 48707,
    name: 'Anti-Magic Shell',
    icon: 'spell_shadow_antimagicshell',
  },
  ARMY_OF_THE_DEAD: {
    id: 42650,
    name: 'Army of the Dead',
    icon: 'spell_deathknight_armyofthedead',
  },
  BLOOD_BOIL: {
    id: 48721,
    name: 'Blood Boil',
    icon: 'spell_deathknight_bloodboil',
  },
  BLOOD_PRESENCE: {
    id: 48263,
    name: 'Blood Presence',
    icon: 'spell_deathknight_bloodpresence',
  },
  BLOOD_STRIKE: {
    id: 49930,
    name: 'Blood Strike',
    icon: 'spell_deathknight_deathstrike',
    lowRanks: [49929, 49928, 49927, 49926, 45902],
  },
  BLOOD_TAP: {
    id: 45529,
    name: 'Blood Tap',
    icon: 'spell_deathknight_bloodtap',
  },
  BONE_SHIELD: {
    id: 49222,
    name: 'Bone Shield',
    icon: 'inv_chest_leather_13',
  },
  CHAINS_OF_ICE: {
    id: 45524,
    name: 'Chains of Ice',
    icon: 'spell_frost_chainsofice',
  },
  CORPSE_EXPLOSION: {
    id: 51328,
    name: 'Corpse Explosion',
    icon: 'ability_creature_disease_02',
    lowRanks: [51327, 51326, 51325, 49158],
  },
  DARK_COMMAND: {
    id: 56222,
    name: 'Dark Command',
    icon: 'spell_nature_shamanrage',
  },
  DARK_SIMULACRUM: {
    id: 77606,
    name: 'Dark Simulacrum',
    icon: 'spell_holy_consumemagic',
  },
  DEATH_AND_DECAY: {
    id: 43265,
    name: 'Death and Decay',
    icon: 'spell_shadow_deathanddecay',
  },
  DEATH_COIL_DK: {
    id: 47541,
    name: 'Death Coil',
    icon: 'spell_shadow_deathcoil',
  },
  DEATH_GRIP: {
    id: 49576,
    name: 'Death Grip',
    icon: 'spell_deathknight_strangulate',
  },
  DEATH_PACT: {
    id: 48743,
    name: 'Death Pact',
    icon: 'spell_shadow_deathpact',
  },
  DEATH_STRIKE: {
    id: 49998,
    name: 'Death Strike',
    icon: 'spell_deathknight_butcher2',
  },
  EMPOWER_RUNE_WEAPON: {
    id: 47568,
    name: 'Empower Rune Weapon',
    icon: 'inv_sword_62',
  },
  FROST_PRESENCE: {
    id: 48266,
    name: 'Frost Presence',
    icon: 'spell_deathknight_frostpresence',
  },
  FROZEN_RUNE_WEAPON: {
    id: 49142,
    name: 'Frozen Rune Weapon',
    icon: 'spell_deathknight_frozenruneweapon',
  },
  HORN_OF_WINTER: {
    id: 57330,
    name: 'Horn of Winter',
    icon: 'inv_misc_horn_02',
  },
  ICEBOUND_FORTITUDE: {
    id: 48792,
    name: 'Icebound Fortitude',
    icon: 'spell_deathknight_iceboundfortitude',
  },
  ICY_TOUCH: {
    id: 45477,
    name: 'Icy Touch',
    icon: 'spell_deathknight_icetouch',
  },
  MIND_FREEZE: {
    id: 47528,
    name: 'Mind Freeze',
    icon: 'spell_deathknight_mindfreeze',
  },
  OBLITERATE: {
    id: 51425,
    name: 'Obliterate',
    icon: 'spell_deathknight_classicon',
    lowRanks: [51424, 51423, 49020, 66198],
  },
  PATH_OF_FROST: {
    id: 3714,
    name: 'Path of Frost',
    icon: 'spell_deathknight_pathoffrost',
  },
  PESTILENCE: {
    id: 50842,
    name: 'Pestilence',
    icon: 'spell_shadow_plaguecloud',
  },
  PLAGUE_STRIKE: {
    id: 45462,
    name: 'Plague Strike',
    icon: 'spell_deathknight_empowerruneblade',
  },
  RAISE_ALLY: {
    id: 61999,
    name: 'Raise Ally',
    icon: 'spell_shadow_deadofnight',
  },
  RAISE_DEAD: {
    id: 46584,
    name: 'Raise Dead',
    icon: 'spell_shadow_animatedead',
  },
  RUNE_OF_CINDERGLACIER: {
    id: 3369,
    name: 'Rune of Cinderglacier (enchant)',
    icon: 'spell_shadow_chilltouch',
  },
  RUNE_OF_LICHBANE: {
    id: 3366,
    name: 'Rune of Lichbane (enchant)',
    icon: 'spell_holy_harmundeadaura',
  },
  RUNE_OF_RAZORICE: {
    id: 3370,
    name: 'Rune of Razorice (enchant)',
    icon: 'spell_frost_frostarmor',
  },
  RUNE_OF_SPELLBREAKING: {
    id: 3595,
    name: 'Rune of Spellbreaking (enchant)',
    icon: 'spell_shadow_antimagicshell',
  },
  RUNE_OF_SPELLSHATTERING: {
    id: 3367,
    name: 'Rune of Spellshattering (enchant)',
    icon: 'spell_shadow_antimagicshell',
  },
  RUNE_OF_SWORDBREAKING: {
    id: 3594,
    name: 'Rune of Swordbreaking (enchant)',
    icon: 'ability_parry',
  },
  RUNE_OF_SWORDSHATTERING: {
    id: 3365,
    name: 'Rune of Swordshattering (enchant)',
    icon: 'ability_parry',
  },
  RUNE_OF_THE_FALLEN_CRUSADER: {
    id: 3368,
    name: 'Rune of the Fallen Crusader (enchant)',
    icon: 'spell_holy_retributionaura',
  },
  RUNE_OF_THE_NERUBIAN_CARAPACE: {
    id: 3883,
    name: 'Rune of the Nerubian Carapace (enchant)',
    icon: 'inv_sword_61',
  },
  RUNE_OF_THE_STONESKIN_GARGOYLE: {
    id: 3847,
    name: 'Rune of the Stoneskin Gargoyle',
    icon: 'inv_sword_130',
  },
  RUNE_STRIKE: {
    id: 56815,
    name: 'Rune Strike',
    icon: 'spell_deathknight_darkconviction',
  },
  STRANGULATE: {
    id: 47476,
    name: 'Strangulate',
    icon: 'spell_shadow_soulleech_3',
  },
  UNHOLY_PRESENCE: {
    id: 48265,
    name: 'Unholy Presence',
    icon: 'spell_deathknight_unholypresence',
  },
  OUTBREAK: {
    id: 77575,
    name: 'Outbreak',
    icon: 'spell_deathvortex',
  },

  // ---------
  // TALENTS
  // ---------

  // Blood
  DANCING_RUNE_WEAPON: {
    id: 49028,
    name: 'Dancing Rune Weapon',
    icon: 'inv_sword_07',
  },
  DEATH_RUNE_MASTERY: {
    id: 50034,
    name: 'Death Rune Mastery',
    icon: 'inv_sword_62',
    lowRanks: [50033],
  },
  HEART_STRIKE: {
    id: 55050,
    name: 'Heart Strike',
    icon: 'inv_weapon_shortblade_40',
  },
  MARK_OF_BLOOD: {
    id: 49005,
    name: 'Mark of Blood',
    icon: 'ability_hunter_rapidkilling',
  },
  RUNE_TAP: {
    id: 48982,
    name: 'Rune Tap',
    icon: 'spell_deathknight_runetap',
  },
  UNHOLY_FRENZY: {
    id: 49016,
    name: 'Unholy Frenzy',
    icon: 'spell_deathknight_bladedarmor',
  },
  VAMPIRIC_BLOOD: {
    id: 55233,
    name: 'Vampiric Blood',
    icon: 'spell_shadow_lifedrain',
  },

  // Frost
  DEATHCHILL: {
    id: 49796,
    name: 'Deathchill',
    icon: 'spell_shadow_soulleech_2',
  },
  FROST_STRIKE: {
    id: 55268,
    name: 'Frost Strike',
    icon: 'spell_deathknight_empowerruneblade2',
    lowRanks: [51419, 51418, 51417, 51416, 49143],
  },
  HOWLING_BLAST: {
    id: 51411,
    name: 'Howling Blast',
    icon: 'spell_frost_arcticwinds',
    lowRanks: [51410, 51409, 49184],
  },
  HUNGERING_COLD: {
    id: 49203,
    name: 'Hungering Cold',
    icon: 'inv_staff_15',
  },
  ICY_TALONS_BUFF: {
    id: 58578,
    name: 'Icy Talons',
    icon: 'spell_deathknight_icytalons',
  },
  LICHBORNE: {
    id: 49039,
    name: 'Lichborne',
    icon: 'spell_shadow_raisedead',
  },
  UNBREAKABLE_ARMOR: {
    id: 51271,
    name: 'Unbreakable Armor',
    icon: 'inv_armor_helm_plate_naxxramas_raidwarrior_c_01',
  },

  // Unholy
  ANTI_MAGIC_ZONE: {
    id: 51052,
    name: 'Anti-Magic Zone',
    icon: 'spell_deathknight_antimagiczone',
  },
  DESECRATION: {
    id: 55667,
    name: 'Desecration',
    icon: 'spell_shadow_shadowfiend',
    lowRanks: [55666],
  },
  EBON_PLAGUE: {
    id: 51735,
    name: 'Ebon Plague', // debuff on enemy
    icon: 'spell_shadow_nethercloak',
  },
  GHOUL_FRENZY: {
    id: 63560,
    name: 'Ghoul Frenzy',
    icon: 'ability_ghoulfrenzy',
  },
  SCOURGE_STRIKE: {
    id: 55271,
    name: 'Scourge Strike',
    icon: 'spell_deathknight_scourgestrike',
    lowRanks: [55270, 55265, 55090],
  },
  SUMMON_GARGOYLE: {
    id: 49206,
    name: 'Summon Gargoyle',
    icon: 'ability_hunter_pet_bat',
  },
} satisfies Record<string, Spell>;

export default spells;
