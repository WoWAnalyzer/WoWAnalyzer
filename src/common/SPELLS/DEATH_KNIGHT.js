/**
 * All Death Knight abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Blood:
  // Artifact
  CONSUMPTION: {
    id: 205223,
    name: 'Consumption',
    icon: 'inv_axe_2h_artifactmaw_d_01',
  },
  // Damage Dealing
  // Provides the 1 RP tick on DnD from Rapid Decomposition Talent
  RAPID_DECOMPOSITION_RP_TICK: {
    id: 255203,
    name: 'Rapid Decomposition RP Tick',
    icon: 'ability_deathknight_deathsiphon2',
  },

  BLOOD_BOIL: {
    id: 50842,
    name: 'Blood Boil',
    icon: 'spell_deathknight_bloodboil',
  },

  HEART_STRIKE: {
    id: 206930,
    name: 'Heart Strike',
    icon: 'inv_weapon_shortblade_40',
  },

  // Only used during Dancing Rune Weapon. Its the Heart Strike of the copied weapons. Generates 5 RP.
  BLOOD_STRIKE: {
    id: 220890,
    name: 'Blood Strike',
    icon: 'spell_deathknight_deathstrike',
  },
  MARROWREND: {
    id: 195182,
    name: 'Marrowrend',
    icon: 'ability_deathknight_marrowrend',
  },
  BLOOD_PLAGUE: {
    id: 55078,
    name: 'Blood Plague',
    icon: 'spell_deathknight_bloodplague',
  },
  DEATHS_CARESS: {
    id: 195292,
    name: 'Death\'s Caress',
    icon: 'ability_deathknight_deathscaress',
  },

  // Cooldowns
  DANCING_RUNE_WEAPON: {
    id: 49028,
    name: 'Dancing Rune Weapon',
    icon: 'inv_sword_07',
  },

  DANCING_RUNE_WEAPON_BUFF: {
    id: 81256,
    name: 'Dancing Rune Weapon',
    icon: 'inv_sword_07',
  },

  VAMPIRIC_BLOOD: {
    id: 55233,
    name: 'Vampiric Blood',
    icon: 'spell_shadow_lifedrain',
  },

  BONE_SHIELD: {
    id: 195181,
    name: 'Bone Shield',
    icon: 'ability_deathknight_boneshield',
  },

  BLOOD_SHIELD: {
    id: 77535,
    name: 'Blood Shield',
    icon: 'spell_deathknight_deathstrike',
  },

  MARK_OF_BLOOD: {
    id: 61606,
    name: 'Mark of Blood',
    icon: 'ability_hunter_rapidkilling',
  },

// Buffs
  OSSUARY: {
    id: 219788,
    name: 'Ossuary',
    icon: 'ability_deathknight_brittlebones',
  },

  CRIMSON_SCOURGE: {
    id: 81141,
    name: 'Crimson Scourge',
    icon: 'ability_warrior_bloodnova',
  },
  UNENDING_THIRST: {
    id: 192567,
    name: 'Unending Thirst',
    icon: 'ability_ironmaidens_whirlofblood',
  },
  VAMPIRIC_AURA: {
    id: 238698,
    name: 'Vampiric Aura',
    icon: 'ability_ironmaidens_maraksbloodcalling',
  },

  // CC
  GOREFIENDS_GRASP: {
    id: 108199,
    name: 'Gorefiend\'s Grasp',
    icon: 'ability_deathknight_aoedeathgrip',
  },

  //Blood DK Version
  ASPHYXIATE: {
    id: 221562,
    name: 'Asphyxiate',
    icon: 'ability_deathknight_asphixiate',
  },

  // Blood Tier Sets
  // T20 2 Piece
  BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF: {
    id: 242001,
    name: 'T20 2 Set Bonus',
    icon: 'spell_deathknight_bloodpresence',
  },
  // T20 4 Piece
  BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF: {
    id: 242009,
    name: 'T20 4 Set Bonus',
    icon: 'spell_deathknight_bloodpresence',
  },
  // T20 Buff
  GRAVEWARDEN: {
    id: 242010,
    name: 'Gravewarden',
    icon: 'ability_warrior_bloodsurge',
  },

  // Frost:
  // Artifact
  SINDRAGOSAS_FURY_ARTIFACT: {
    id: 190778,
    name: 'Sindragosa\'s Fury',
    icon: 'achievement_boss_sindragosa',
  },
  // Damage Dealing
  FROST_FEVER: {
    id: 55095,
    name: 'Frost Fever',
    icon: 'spell_deathknight_frostfever',
  },
  FROST_STRIKE: {
    id: 49143,
    name: 'Frost Strike',
    icon: 'spell_deathknight_empowerruneblade2',
  },
  OBLITERATE: {
    id: 49020,
    name: 'Obliterate',
    icon: 'spell_deathknight_classicon',
  },
  HOWLING_BLAST: {
    id: 49184,
    name: 'Howling Blast',
    icon: 'spell_frost_arcticwinds',
  },
  REMORSELESS_WINTER_ENV_CAST: {
    id: 211793,
    name: 'Remorseless Winter',
    icon: 'ability_deathknight_remorselesswinters2',
  },
  REMORSELESS_WINTER_BUFF: {
    id: 196771,
    name: 'Remorseless Winter',
    icon: 'ability_deathknight_remorselesswinters2',
  },
  REMORSELESS_WINTER: { // This the spell the player see
    id: 196770,
    name: 'Remorseless Winter',
    icon: 'ability_deathknight_remorselesswinters2',
  },
  // Buffs
  EMPOWER_RUNE_WEAPON: {
    id: 47568,
    name: 'Empower Rune Weapon',
    icon: 'inv_sword_62',
  },
  PILLAR_OF_FROST: {
    id: 51271,
    name: 'Pillar of Frost',
    icon: 'ability_deathknight_pillaroffrost',
  },
  // Procs
  RIME: {
    id: 59052,
    name: 'Rime',
    icon: 'spell_frost_arcticwinds',
  },
  KILLING_MACHINE: {
    id: 51128,
    name: 'Killing Machine',
    icon: 'inv_sword_122',
  },
  RAZORICE: {
    id: 50401,
    name: 'Razorice',
    icon: 'spell_deathknight_frozenruneweapon',
  },
  // T20 2P
  FROST_DEATH_KNIGHT_T20_2SET_BONUS_BUFF: {
    id: 242058,
    name: 'T20 2 Set Bonus',
    icon: 'spell_deathknight_frostpresence',
  },
  // T20 4P
  FROST_DEATH_KNIGHT_T20_4SET_BONUS_BUFF: {
    id: 242063,
    name: 'T20 4 Set Bonus',
    icon: 'spell_deathknight_frostpresence',
  },
  // Talents
  RUNIC_ATTENUATION_TALENT: {
    id: 207104,
    name: 'Runic Attenuation',
    icon: 'Boss_odunrunes_blue',
  },
  ABOMINATIONS_MIGHT_TALENT: {
    id: 207161,
    name: 'Abomination\'s Might',
    icon: 'spell_deathknight_icetouch',
  },
  AVALANCHE_TALENT: {
    id: 207142,
    name: 'Avalanche',
    icon: 'spell-frost-icestorm',
  },
  BLINDING_SLEET_TALENT: {
    id: 207167,
    name: 'Blinding Sleet',
    icon: 'spell-frost-chillingblast',
  },
  BREATH_OF_SINDRAGOSA_TALENT: {
    id: 152279,
    name: 'Breath of Sindragosa',
    icon: 'spell_deathknight_breathofsindragosa',
  },
  FREEZING_FOG_TALENT: {
    id: 207060,
    name: 'Freezing Fog',
    icon: 'spell_frost_arcticwinds',
  },
  FROSTSCYTHE_TALENT: {
    id: 207230,
    name: 'Frostscythe',
    icon: 'inv_misc_2h_farmscythe_a_01',
  },
  FROZEN_PULSE_TALENT: {
    id: 194909,
    name: 'Frozen Pulse',
    icon: 'inv_misc_permafrostshard',
  },
  GATHERING_STORM_TALENT: {
    id: 194912,
    name: 'Gathering Storm',
    icon: 'spell_frost_ice-shards',
  },
  GLACIAL_ADVANCE_TALENT: {
    id: 194913,
    name: 'Glacial Advance',
    icon: 'ability_hunter_glacialtrap',
  },
  HORN_OF_WINTER_TALENT: {
    id: 57330,
    name: 'Horn of Winter',
    icon: 'inv_misc_horn_02',
  },
  HUNGERING_RUNE_WEAPON_TALENT: {
    id: 207127,
    name: 'Hungering Rune Weapon',
    icon: 'ability_deathknight_hungeringruneblade',
  },
  ICECAP_TALENT: {
    id: 207126,
    name: 'Icecap',
    icon: 'inv_misc_herb_icecap',
  },
  ICY_TALONS_TALENT: {
    id: 194878,
    name: 'Icy Talons',
    icon: 'spell_deathknight_icytalon',
  },
  INEXORABLE_ASSAULT_TALENT: {
    id: 253593,
    name: 'Inexorable Assault',
    icon: 'achievement_dungeon_icecrown_frostmourne',
  },
  MURDEROUS_EFFICIENCY_TALENT: {
    id: 207061,
    name: 'Murderous Efficiency',
    icon: 'spell_frost_frostarmor',
  },
  OBLITERATION_TALENT: {
    id: 207256,
    name: 'Obliteration',
    icon: 'inv_axe_114',
  },
  PERMAFROST_TALENT: {
    id: 207200,
    name: 'Permafrost',
    icon: 'achievement_zone_frostfire',
  },
  SHATTERING_STRIKES_TALENT: {
    id: 207057,
    name: 'Shattering Strikes',
    icon: 'ability_warrior_shatteringthrow',
  },
  VOLATILE_SHIELDING_TALENT: {
    id: 207188,
    name: 'Volatile Shielding',
    icon: 'ability_mage_shattershield',
  },
  WINTER_IS_COMING_TALENT: {
    id: 207170,
    name: 'Winter is Coming',
    icon: 'inv_wolfdraenormountfrost',
  },
  // Unholy:
  // Aritfact ability
  APOCALYPSE: {
    id: 220143,
    name: 'Apocalypse',
    icon: 'artifactability_unholydeathknight_deathsembrace',
  },

  // Spells
  ARMY_OF_THE_DEAD: {
    id: 42650,
    name: 'Army of the Dead',
    icon: 'spell_deathknight_armyofthedead',
  },

  DARK_TRANSFORMATION: {
    id: 63560,
    name: 'Dark Transformation',
    icon: 'achievement_boss_festergutrotface',
  },

  DEATH_COIL: {
    id: 47541,
    name: 'Death Coil',
    icon: 'spell_shadow_deathcoil',
  },

  DEATH_COIL_DAMAGE: {
    id: 47632,
    name: 'Death Coil',
    icon: 'spell_shadow_deathcoil',
  },

  FESTERING_STRIKE: {
    id: 85948,
    name: 'Festering Strike',
    icon: 'spell_deathknight_festering_strike',
  },

  FESTERING_WOUND: {
    id: 194310,
    name: 'Festering Wound',
    icon: 'spell_yorsahj_bloodboil_purpleoil',
  },

  FESTERING_WOUND_BURST: {
    id: 195757,
    name: 'Festering Wound',
    icon: 'achievement_halloween_rottenegg_01',
  },

  OUTBREAK: {
    id: 77575,
    name: 'Outbreak',
    icon: 'spell_deathvortex',
  },

  RAISE_DEAD: {
    id: 46584,
    name: 'Raise Dead',
    icon: 'spell_shadow_animatedead',
  },

  RUNIC_CORRUPTION: {
    id: 51462,
    name: 'Runic Corruption',
    icon: 'spell_shadow_rune',
  },

  // scourge strike has one cast event but two damage events, the cast and physical
  // damage happen on id 55090, the shadow damage is on id 70890
  SCOURGE_STRIKE: {
    id: 55090,
    name: 'Scourge Strike',
    icon: 'spell_deathknight_scourgestrike',
  },

  SCOURGE_STRIKE_SHADOW_DAMAGE: {
    id: 70890,
    name: 'Scourge Strike',
    icon: 'spell_deathknight_scourgestrike',
  },

  SUMMON_GARGOYLE: {
    id: 49206,
    name: 'Summon Gargoyle',
    icon: 'ability_deathknight_summongargoyle',
  },

  VIRULENT_PLAGUE: {
    id: 191587,
    name: 'Virulent Plague',
    icon: 'ability_creature_disease_02',
  },

  UNHOLY_FRENZY_BUFF: {
    id: 207290,
    name: 'Unholy Frenzy',
    icon: 'spell_shadow_unholyfrenzy',
  },

  UNHOLY_STRENGTH_BUFF: {
	  id: 53365,
	  name: 'Unholy Strength',
	  icon: 'spell_holy_blessingofstrength',
  },

  // Unholy Tier Sets
  // T20 2 Piece and buff
  UNHOLY_DEATH_KNIGHT_T20_2SET_BONUS: {
    id: 242064,
    name: 'T20 2 Set Bonus',
    icon: 'spell_deathknight_unholypresence',
  },

  MASTER_OF_GHOULS_BUFF: {
    id: 246995,
    name: 'Master of Ghouls',
    icon: 'spell_deathknight_unholypresence',
  },

  UNHOLY_DEATH_KNIGHT_T21_4SET_BONUS: {
    id: 251872,
    name: 'T21 4 Set Bonus',
    icon: 'ability_paladin_conviction',
  },

  UNHOLY_DEATH_KNIGHT_T21_2SET_BONUS: {
    id: 251871,
    name: 'T21 2 Set Bonus',
    icon: 'ability_paladin_conviction',
  },

  COILS_OF_DEVASTATION: { // debuff and damage from t21 2p
    id: 253367,
    name: 'Coils of Devastation (T21 2 Set Bonus)',
    icon: 'ability_malkorok_blightofyshaarj_green',
  },

  // Artifact traits:
  SUDDEN_DOOM: {
    id: 49530,
    name: 'Sudden Doom',
    icon: 'spell_shadow_painspike',
  },

  ETERNAL_AGONY: {
    id: 208598,
    name: 'Eternal Agony',
    icon: 'achievement_boss_festergutrotface',
  },

  SCOURGE_OF_WORLDS: {
    id: 191747,
    name: 'Scourge of Worlds',
    icon: 'artifactability_unholydeathknight_flagellation',
  },

  SCOURGE_OF_WORLDS_DEBUFF: {
    id: 191748,
    name: 'Scourge of Worlds',
    icon: 'artifactability_unholydeathknight_flagellation',
  },

  // Shared:
  ANTI_MAGIC_SHELL: {
    id: 48707,
    name: 'Anti-Magic Shell',
    icon: 'spell_shadow_antimagicshell',
  },

  ANTI_MAGIC_SHELL_RP_GAINED: {
    id: 49088,
    name: 'Anti-Magic Shell RP Gained',
    icon: 'spell_holy_righteousnessaura',
  },

  CHAINS_OF_ICE: {
    id: 45524,
    name: 'Chains of Ice',
    icon: 'spell_frost_chainsofice',
  },

  DARK_COMMAND: {
    id: 56222,
    name: 'Dark Command',
    icon: 'spell_nature_shamanrage',
  },

  DEATH_GRIP: {
    id: 49576,
    name: 'Death Grip',
    icon: 'spell_deathknight_strangulate',
  },

  MIND_FREEZE: {
    id: 47528,
    name: 'Mind Freeze',
    icon: 'spell_deathknight_mindfreeze',
  },

  DEATH_AND_DECAY: {
    id: 43265,
    name: 'Death and Decay',
    icon: 'spell_shadow_deathanddecay',
  },

  DEATH_STRIKE: {
    id: 49998,
    name: 'Death Strike',
    icon: 'spell_deathknight_butcher2',
  },

  DEATH_STRIKE_HEAL: {
    id: 45470,
    name: 'Death Strike Heal',
    icon: 'spell_deathknight_butcher2',
  },

  ICEBOUND_FORTITUDE: {
    id: 48792,
    name: 'Icebound Fortitude',
    icon: 'spell_deathknight_iceboundfortitude',
  },

  CONTROL_UNDEAD: {
    id: 111673,
    name: 'Control Undead',
    icon: 'inv_misc_bone_skull_01',
  },

  DEATH_GATE: {
    id: 50977,
    name: 'Death Gate',
    icon: 'spell_arcane_teleportundercity',
  },

  PATH_OF_FROST: {
    id: 3714,
    name: 'Path of Frost',
    icon: 'spell_deathknight_pathoffrost',
  },

  RAISE_ALLY: {
    id: 61999,
    name: 'Raise Ally',
    icon: 'spell_shadow_deadofnight',
  },

  WRAITH_WALK: {
    id: 212552,
    name: 'Wraith Walk',
    icon: 'inv_helm_plate_raiddeathknight_p_01',
  },

  COLD_HEART_BUFF: {
    id: 235599,
    name: 'Cold Heart',
    icon: 'spell_frost_chainsofice',
  },

  COLD_HEART_DEBUFF: {
    id: 248397,
    name: 'Cold Heart',
    icon: 'spell_frost_chainsofice',
  },

  //Skullflower's Haemostasis blood dk legendary buff
  HAEMOSTASIS_BUFF: {
    id: 235559,
    name: 'Haemostasis',
    icon: 'ability_deathwing_bloodcorruption_earth',
  },
  
  //Shackles of Bryndaor blood dk legendary buff
  SHACKLES_OF_BRYNDAOR_BUFF: {
    id: 209232,
    name: 'Shackles of Bryndaor',
    icon: 'ability_deathknight_runicimpowerment',
  },
};
