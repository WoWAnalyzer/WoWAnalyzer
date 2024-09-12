/**
 * All Classic Death Knight spells (including talent spells) go here.
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
    icon: 'spell_shadow_antimagicshell.jpg',
  },
  ARMY_OF_THE_DEAD: {
    id: 42650,
    name: 'Army of the Dead',
    icon: 'spell_deathknight_armyofthedead.jpg',
  },
  BLOOD_BOIL: {
    id: 48721,
    name: 'Blood Boil',
    icon: 'spell_deathknight_bloodboil.jpg',
  },
  BLOOD_PRESENCE: {
    id: 48263,
    name: 'Blood Presence',
    icon: 'spell_deathknight_bloodpresence.jpg',
  },
  BLOOD_STRIKE: {
    id: 45902,
    name: 'Blood Strike',
    icon: 'spell_deathknight_deathstrike.jpg',
  },
  BLOOD_TAP: {
    id: 45529,
    name: 'Blood Tap',
    icon: 'spell_deathknight_bloodtap.jpg',
  },
  CHAINS_OF_ICE: {
    id: 45524,
    name: 'Chains of Ice',
    icon: 'spell_frost_chainsofice.jpg',
  },
  DARK_COMMAND: {
    id: 56222,
    name: 'Dark Command',
    icon: 'spell_nature_shamanrage.jpg',
  },
  DARK_SIMULACRUM: {
    id: 77606,
    name: 'Dark Simulacrum',
    icon: 'spell_holy_consumemagic.jpg',
  },
  DEATH_AND_DECAY: {
    id: 43265,
    name: 'Death and Decay',
    icon: 'spell_shadow_deathanddecay.jpg',
  },
  DEATH_COIL_DK: {
    id: 47541,
    name: 'Death Coil',
    icon: 'spell_shadow_deathcoil.jpg',
  },
  DEATH_GRIP: {
    id: 49576,
    name: 'Death Grip',
    icon: 'spell_deathknight_strangulate.jpg',
  },
  DEATH_PACT: {
    id: 48743,
    name: 'Death Pact',
    icon: 'spell_shadow_deathpact.jpg',
  },
  DEATH_STRIKE: {
    id: 49998,
    name: 'Death Strike',
    icon: 'spell_deathknight_butcher2.jpg',
  },
  EMPOWER_RUNE_WEAPON: {
    id: 47568,
    name: 'Empower Rune Weapon',
    icon: 'inv_sword_62.jpg',
  },
  FESTERING_STRIKE: {
    id: 85948,
    name: 'Festering Strike',
    icon: 'inv_sword_61.jpg',
  },
  FESTERING_STRIKE_OFFHAND: {
    id: 86061,
    name: 'Festering Strike Off-Hand',
    icon: 'inv_sword_61.jpg',
  },
  FROST_PRESENCE: {
    id: 48266,
    name: 'Frost Presence',
    icon: 'spell_deathknight_frostpresence.jpg',
  },
  HORN_OF_WINTER: {
    id: 57330,
    name: 'Horn of Winter',
    icon: 'inv_misc_horn_02.jpg',
  },
  ICEBOUND_FORTITUDE: {
    id: 48792,
    name: 'Icebound Fortitude',
    icon: 'spell_deathknight_iceboundfortitude.jpg',
  },
  ICY_TOUCH: {
    id: 45477,
    name: 'Icy Touch',
    icon: 'spell_deathknight_icetouch.jpg',
  },
  MIND_FREEZE: {
    id: 47528,
    name: 'Mind Freeze',
    icon: 'spell_deathknight_mindfreeze.jpg',
  },
  NECROTIC_STRIKE: {
    id: 73975,
    name: 'Necrotic Strike',
    icon: 'inv_axe_96.jpg',
  },
  OBLITERATE: {
    id: 49020,
    name: 'Obliterate',
    icon: 'spell_deathknight_classicon.jpg',
  },
  OBLITERATE_OFFHAND: {
    id: 66198,
    name: 'Obliterate Off-Hand',
    icon: 'spell_deathknight_classicon.jpg',
  },
  OUTBREAK: {
    id: 77575,
    name: 'Outbreak',
    icon: 'spell_deathvortex.jpg',
  },
  PATH_OF_FROST: {
    id: 3714,
    name: 'Path of Frost',
    icon: 'spell_deathknight_pathoffrost.jpg',
  },
  PESTILENCE: {
    id: 50842,
    name: 'Pestilence',
    icon: 'spell_shadow_plaguecloud.jpg',
  },
  PLAGUE_STRIKE: {
    id: 45462,
    name: 'Plague Strike',
    icon: 'spell_deathknight_empowerruneblade.jpg',
  },
  RAISE_ALLY: {
    id: 61999,
    name: 'Raise Ally',
    icon: 'spell_shadow_deadofnight.jpg',
  },
  RAISE_DEAD: {
    id: 46584,
    name: 'Raise Dead',
    icon: 'spell_shadow_animatedead.jpg',
  },
  RUNE_OF_CINDERGLACIER: {
    id: 3369, // Enchant Id
    name: 'Rune of Cinderglacier (enchant)',
    icon: 'spell_shadow_chilltouch.jpg',
  },
  RUNE_OF_LICHBANE: {
    id: 3366, // Enchant Id
    name: 'Rune of Lichbane (enchant)',
    icon: 'spell_holy_harmundeadaura.jpg',
  },
  RUNE_OF_RAZORICE: {
    id: 3370, // Enchant Id
    name: 'Rune of Razorice (enchant)',
    icon: 'spell_frost_frostarmor.jpg',
  },
  RUNE_OF_SPELLBREAKING: {
    id: 3595, // Enchant Id
    name: 'Rune of Spellbreaking (enchant)',
    icon: 'spell_shadow_antimagicshell.jpg',
  },
  RUNE_OF_SPELLSHATTERING: {
    id: 3367, // Enchant Id
    name: 'Rune of Spellshattering (enchant)',
    icon: 'spell_shadow_antimagicshell.jpg',
  },
  RUNE_OF_SWORDBREAKING: {
    id: 3594, // Enchant Id
    name: 'Rune of Swordbreaking (enchant)',
    icon: 'ability_parry.jpg',
  },
  RUNE_OF_SWORDSHATTERING: {
    id: 3365, // Enchant Id
    name: 'Rune of Swordshattering (enchant)',
    icon: 'ability_parry.jpg',
  },
  RUNE_OF_THE_FALLEN_CRUSADER: {
    id: 3368, // Enchant Id
    name: 'Rune of the Fallen Crusader (enchant)',
    icon: 'spell_holy_retributionaura.jpg',
  },
  RUNE_OF_THE_NERUBIAN_CARAPACE: {
    id: 3883, // Enchant Id
    name: 'Rune of the Nerubian Carapace (enchant)',
    icon: 'inv_sword_61.jpg',
  },
  RUNE_OF_THE_STONESKIN_GARGOYLE: {
    id: 3847, // Enchant Id
    name: 'Rune of the Stoneskin Gargoyle',
    icon: 'inv_sword_130.jpg',
  },
  RUNE_STRIKE: {
    id: 56815,
    name: 'Rune Strike',
    icon: 'spell_deathknight_darkconviction.jpg',
  },
  STRANGULATE: {
    id: 47476,
    name: 'Strangulate',
    icon: 'spell_shadow_soulleech_3.jpg',
  },
  UNHOLY_PRESENCE: {
    id: 48265,
    name: 'Unholy Presence',
    icon: 'spell_deathknight_unholypresence.jpg',
  },
  // ---------
  // TALENTS
  // ---------
  // Blood
  BLOOD_RITES: {
    id: 50034,
    name: 'Blood Rites',
    icon: 'spell_deathknight_bloodtap.jpg',
  },
  BONE_SHIELD: {
    id: 49222,
    name: 'Bone Shield',
    icon: 'ability_deathknight_boneshield.jpg',
  },
  DANCING_RUNE_WEAPON: {
    id: 49028,
    name: 'Dancing Rune Weapon',
    icon: 'inv_sword_07.jpg',
  },
  HEART_STRIKE: {
    id: 55050,
    name: 'Heart Strike',
    icon: 'inv_weapon_shortblade_40.jpg',
  },
  RUNE_TAP: {
    id: 48982,
    name: 'Rune Tap',
    icon: 'spell_deathknight_runetap.jpg',
  },
  VAMPIRIC_BLOOD: {
    id: 55233,
    name: 'Vampiric Blood',
    icon: 'spell_shadow_lifedrain.jpg',
  },
  // Frost
  HOWLING_BLAST: {
    id: 49184,
    name: 'Howling Blast',
    icon: 'spell_frost_arcticwinds.jpg',
  },
  HUNGERING_COLD: {
    id: 49203,
    name: 'Hungering Cold',
    icon: 'inv_staff_15.jpg',
  },
  LICHBORNE: {
    id: 49039,
    name: 'Lichborne',
    icon: 'spell_shadow_raisedead.jpg',
  },
  PILLAR_OF_FROST: {
    id: 51271,
    name: 'Pillar of Frost',
    icon: 'ability_deathknight_pillaroffrost.jpg',
  },
  // Unholy
  ANTI_MAGIC_ZONE: {
    id: 51052,
    name: 'Anti-Magic Zone',
    icon: 'spell_deathknight_antimagiczone.jpg',
  },
  DESECRATION: {
    id: 55667,
    name: 'Desecration',
    icon: 'spell_shadow_shadowfiend.jpg',
  },
  EBON_PLAGUE: {
    id: 65142,
    name: 'Ebon Plague', // debuff on enemy
    icon: 'ability_creature_cursed_03.jpg',
  },
  DARK_TRANSFORMATION: {
    id: 63560,
    name: 'Dark Transformation',
    icon: 'achievement_boss_festergutrotface.jpg',
  },
  SCOURGE_STRIKE: {
    id: 55090,
    name: 'Scourge Strike',
    icon: 'spell_deathknight_scourgestrike.jpg',
  },
  SUMMON_GARGOYLE: {
    id: 49206,
    name: 'Summon Gargoyle',
    icon: 'ability_hunter_pet_bat.jpg',
  },
  UNHOLY_FRENZY: {
    id: 49016,
    name: 'Unholy Frenzy',
    icon: 'spell_shadow_unholyfrenzy.jpg',
  },
} satisfies Record<string, Spell>;

export default spells;
