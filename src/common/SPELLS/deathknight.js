/**
 * All Death Knight abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Blood:

  //Summons
  //Bloodworm summon spell by the Bloodworms talent
  BLOODWORM: {
    id: 196361,
    name: 'Bloodworm',
    icon: 'spell_shadow_soulleech',
  },
  //Bloodworm death/heal spell
  BLOODWORM_DEATH: {
    id: 197509,
    name: 'Bloodworm Death/Heal',
    icon: 'spell_shadow_soulleech',
  },

  //Artifact Trait
  UMBILICUS_ETERNUS: {
    id: 193213,
    name: 'Umbilicus Eternus',
    icon: 'artifactability_blooddeathknight_umbilicuseternus',
  },

  UMBILICUS_ETERNUS_BUFF: {
    id: 193320,
    name: 'Umbilicus Eternus Buff',
    icon: 'artifactability_blooddeathknight_umbilicuseternus',
  },

  SOULDRINKER_TRAIT: {
    id: 238114,
    name: 'Souldrinker',
    icon: 'spell_deathknight_butcher2',
  },

  BONEBREAKER_TRAIT: {
    id: 192538,
    name: 'Bonebreaker',
    icon: 'trade_archaeology_fossil_dinosaurbone',
  },

  COAGULOPHATHY_TRAIT: {
    id: 192460,
    name: 'Coagulopathy',
    icon: 'spell_deathknight_bloodplague',
  },

  VEINRENDER_TRAIT: {
    id: 192457,
    name: 'Veinrender',
    icon: 'ability_skeer_bloodletting',
  },

  ALL_CONSUMING_ROT_TRAIT: {
    id: 192464,
    name: 'All-Consuming Rot',
    icon: 'spell_shadow_deathanddecay',
  },

  SKELETAL_SHATTERING_TRAIT: {
    id: 192558,
    name: 'Skeletal Shattering',
    icon: 'trade_archaeology_bones-of-transformation',
  },

  // Damage Dealing
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

  BONESTORM_HIT: {
    id: 196528,
    name: "Bonestorm",
    icon: "achievement_boss_lordmarrowgar",
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

  SHROUD_OF_PURGATORY: {
    id: 116888,
    name: 'Shroud of Purgatory',
    icon: 'inv_misc_shadowegg',
  },

  BONE_SHIELD: {
    id: 195181,
    name: 'Bone Shield',
    icon: 'ability_deathknight_boneshield',
  },

  BLOOD_SHIELD: {
    id: 77535,
    name: 'Blood Shield',
    icon: 'spell_deathknight_butcher2',
  },

  HEARTBREAKER: {
    id: 210738,
    name: 'Heartbreaker',
    icon: 'spell_deathknight_deathstrike',
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
  VORACIOUS: {
    id: 274009,
    name: 'Voracious',
    icon: 'ability_ironmaidens_whirlofblood',
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

  // Frost:

  // Damage Dealing

  FROST_FEVER: {
    id: 55095,
    name: 'Frost Fever',
    icon: 'spell_deathknight_frostfever',
  },
  FROST_STRIKE_CAST: {
    id: 49143,
    name: 'Frost Strike',
    icon: 'spell_deathknight_empowerruneblade2',
  },
  FROST_STRIKE_MAIN_HAND_DAMAGE: {
    id: 222026,
    name: 'Frost Strike',
    icon: 'spell_deathknight_empowerruneblade2',
  },
  FROST_STRIKE_OFF_HAND_DAMAGE: {
    id: 66196,
    name: 'Frost Strike',
    icon: 'spell_deathknight_empowerruneblade2',
  },
  OBLITERATE_CAST: {
    id: 49020,
    name: 'Obliterate',
    icon: 'spell_deathknight_classicon',
  },
  OBLITERATE_MAIN_HAND_DAMAGE: {
    id: 222024,
    name: 'Obliterate',
    icon: 'spell_deathknight_classicon',
  },
  OBLITERATE_OFF_HAND_DAMAGE: {
    id: 66198,
    name: 'Obliterate',
    icon: 'spell_deathknight_classicon',
  },
  HOWLING_BLAST: {
    id: 49184,
    name: 'Howling Blast',
    icon: 'spell_frost_arcticwinds',
  },
  REMORSELESS_WINTER_ENV_CAST: { // not actually sure what this does
    id: 211793,
    name: 'Remorseless Winter',
    icon: 'ability_deathknight_remorselesswinters2',
  },
  REMORSELESS_WINTER_DAMAGE: { // every tick puts a cast event on the environment and also the id of the damage event
    id: 196771,
    name: 'Remorseless Winter',
    icon: 'ability_deathknight_remorselesswinters2',
  },
  REMORSELESS_WINTER: { // This the spell the player casts, triggers energize event, also exists as buff on player
    id: 196770,
    name: 'Remorseless Winter',
    icon: 'ability_deathknight_remorselesswinters2',
  },
  GATHERING_STORM_TALENT_BUFF:{
    id: 211805,
    name: 'Gathering Storm',
    icon: 'spell_frost_ice-shards',
  },
  BREATH_OF_SINDRAGOSA_TALENT_DAMAGE_TICK: {
    id: 155166,
    name: 'Breath of Sindragosa',
    icon: 'spell_deathknight_breathofsindragosa',
  },
  CHILL_STREAK_TALENT: {
    id: 305392,
    name: 'Chill Streak',
    icon: 'spell_frost_piercing-chill',
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
    id: 51124,
    name: 'Killing Machine',
    icon: 'inv_sword_122',
  },

  RAZORICE: {
    id: 50401,
    name: 'Razorice',
    icon: 'spell_deathknight_frozenruneweapon',
  },

  RUNIC_EMPOWERMENT: {
    id: 193486,
    name: 'Runic Empowerment',
    icon: 'inv_misc_rune_10',
  },

  MURDEROUS_EFFICIENCY: {
    id: 207062,
    name: 'Murderous Efficiency',
    icon: 'spell_frost_frostarmor',
  },

  FROST_FEVER_RP_GAIN:{
    id: 195617,
    name: 'Frost Fever',
    icon: 'spell_deathknight_frostfever',
  },

  RUNIC_ATTENUATION_RP_GAIN:{
    id: 221322,
    name: 'Runic Attenuation',
    icon: 'boss_odunrunes_blue',
  },

  BREATH_OF_SINDRAGOSA_TALENT_RUNE_GAIN:{
    id: 303753,
    name: 'Breath of Sindragosa',
    icon: 'inv_misc_rune_10',
  },

  PESTILENT_PUSTULES: {
    id: 220211,
    name: 'Pestilent Pustules',
    icon: 'spell_yorsahj_bloodboil_purpleoil',
  },
  
  // Unholy:
  // Spells
  APOCALYPSE: {
    id: 275699,
    name: 'Apocalypse',
    icon: 'artifactability_unholydeathknight_deathsembrace',
  },

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
    id: 51460,
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

  VIRULENT_PLAGUE: {
    id: 191587,
    name: 'Virulent Plague',
    icon: 'ability_creature_disease_02',
  },

  UNHOLY_STRENGTH_BUFF: {
	  id: 53365,
	  name: 'Unholy Strength',
	  icon: 'spell_holy_blessingofstrength',
  },

  DARK_ARBITER_TALENT_GLYPH: {
    id: 207349,
    name: 'Dark Arbiter',
    icon: 'achievement_boss_svalasorrowgrave',
  },

  // Shared:
  ANTI_MAGIC_SHELL: {
    id: 48707,
    name: 'Anti-Magic Shell',
    icon: 'spell_shadow_antimagicshell',
  },

  ANTI_MAGIC_SHELL_RP_GAINED: {
    id: 49088,
    name: 'Anti-Magic Shell',
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

  DEATH_AND_DECAY_BUFF: {
    id: 188290,
    name: 'Death and Decay',
    icon: 'spell_shadow_deathanddecay',
  },

  DEATH_AND_DECAY_DAMAGE_TICK: {
    id: 52212,
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
    name: 'Death Strike',
    icon: 'spell_deathknight_butcher2',
  },

  CONSUMPTION_HEAL: {
    id: 205224,
    name: 'Consumption Heal',
    icon: 'inv_axe_2h_artifactmaw_d_02',
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

  DEATHS_ADVANCE: {
    id: 48265,
    name: 'Death\'s Advance',
    icon: 'spell_shadow_demonicempathy',
  },

  COLD_HEART_DEBUFF: {
    id: 248397,
    name: 'Cold Heart',
    icon: 'spell_frost_chainsofice',
  },

  RUNE_1: {
    id: -101,
    name: 'Rune 1',
    icon: 'spell_deathknight_frozenruneweapon',
  },
  RUNE_2: {
    id: -102,
    name: 'Rune 2',
    icon: 'spell_deathknight_frozenruneweapon',
  },
  RUNE_3: {
    id: -103,
    name: 'Rune 3',
    icon: 'spell_deathknight_frozenruneweapon',
  },

  RUNIC_POWER:{
    id: 189096,
    name: 'Runic Power',
    icon: 'inv_sword_62',
  },
};
