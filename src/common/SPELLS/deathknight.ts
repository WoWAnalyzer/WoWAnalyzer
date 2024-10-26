/**
 * All Death Knight abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

import Spell, { Enchant } from './Spell';

const spells = {
  // Hero Talents:
  // Deathbringer:
  EXTERMINATE_BUFF: {
    id: 441416,
    name: 'Exterminate',
    icon: 'ability_argus_edgeofobliteration',
  },

  EXTERMINATE_PAINFUL_DEATH_BUFF: {
    id: 447954,
    name: 'Exterminate',
    icon: 'ability_argus_edgeofobliteration',
  },

  EXTERMINATE_FIRST_HIT: {
    id: 441424,
    name: 'Exterminate',
    icon: 'inv_polearm_2h_titanargus_d_01',
  },
  EXTERMINATE_SECOND_HIT: {
    id: 441426,
    name: 'Exterminate',
    icon: 'inv_polearm_2h_titanargus_d_01',
  },

  // Blood:
  DEATHS_CARESS: {
    id: 195292,
    name: "Death's Caress",
    icon: 'ability_deathknight_deathscaress.jpg',
  },

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

  // Damage Dealing
  BONESTORM_TALENT_HIT: {
    id: 196528,
    name: 'Bonestorm',
    icon: 'achievement_boss_lordmarrowgar',
  },

  // Only used during Dancing Rune Weapon. Its the Heart Strike of the copied weapons. Generates 5 RP.
  BLOOD_STRIKE: {
    id: 220890,
    name: 'Blood Strike',
    icon: 'spell_deathknight_deathstrike',
  },
  BLOOD_PLAGUE: {
    id: 55078,
    name: 'Blood Plague',
    icon: 'spell_deathknight_bloodplague',
  },

  // Cooldowns
  DANCING_RUNE_WEAPON_TALENT_BUFF: {
    id: 81256,
    name: 'Dancing Rune Weapon',
    icon: 'inv_sword_07',
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

  CONSUMPTION_TALENT_HEAL: {
    id: 205224,
    name: 'Consumption Heal',
    icon: 'inv_axe_2h_artifactmaw_d_02',
  },

  // Buffs
  OSSUARY_TALENT_BUFF: {
    id: 219788,
    name: 'Ossuary',
    icon: 'ability_deathknight_brittlebones',
  },
  CRIMSON_SCOURGE_TALENT_BUFF: {
    id: 81141,
    name: 'Crimson Scourge',
    icon: 'ability_warrior_bloodnova',
  },
  VORACIOUS_TALENT_BUFF: {
    id: 274009,
    name: 'Voracious',
    icon: 'ability_ironmaidens_whirlofblood',
  },
  RELISH_IN_BLOOD: {
    id: 317614,
    name: 'Relish in Blood',
    icon: 'ability_deathknight_roilingblood',
  },
  COAGULOPATHY_BUFF: {
    id: 391477,
    name: 'Coagulopathy',
    icon: 'ability_skeer_bloodletting',
  },

  // Other
  HEARTBREAKER_ENERGIZE: {
    id: 210738,
    name: 'Heartbreaker',
    icon: 'spell_deathknight_deathstrike',
  },

  // Frost:

  // Damage Dealing

  FROST_FEVER: {
    id: 55095,
    name: 'Frost Fever',
    icon: 'spell_deathknight_frostfever',
  },
  FROST_STRIKE_DAMAGE: {
    id: 325464,
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
  OBLITERATE_DAMAGE: {
    id: 325461,
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
  REMORSELESS_WINTER: {
    id: 196770,
    name: 'Remorseless Winter',
    icon: 'ability_deathknight_remorselesswinters2',
    runesCost: 1,
  },
  REMORSELESS_WINTER_ENV_CAST: {
    // not actually sure what this does
    id: 211793,
    name: 'Remorseless Winter',
    icon: 'ability_deathknight_remorselesswinters2',
  },
  REMORSELESS_WINTER_DAMAGE: {
    // every tick puts a cast event on the environment and also the id of the damage event
    id: 196771,
    name: 'Remorseless Winter',
    icon: 'ability_deathknight_remorselesswinters2',
  },
  GATHERING_STORM_TALENT_BUFF: {
    id: 211805,
    name: 'Gathering Storm',
    icon: 'spell_frost_iceshards',
  },
  BREATH_OF_SINDRAGOSA_TALENT_DAMAGE_TICK: {
    id: 155166,
    name: 'Breath of Sindragosa',
    icon: 'spell_deathknight_breathofsindragosa',
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

  FROST_FEVER_RP_GAIN: {
    id: 195617,
    name: 'Frost Fever',
    icon: 'spell_deathknight_frostfever',
  },

  RUNIC_ATTENUATION_RP_GAIN: {
    id: 221322,
    name: 'Runic Attenuation',
    icon: 'boss_odunrunes_blue',
  },

  BREATH_OF_SINDRAGOSA_TALENT_RUNE_GAIN: {
    id: 303753,
    name: 'Breath of Sindragosa',
    icon: 'inv_misc_rune_10',
  },

  OBLITERATION_RUNE_GAIN: {
    id: 281327,
    name: 'Obliteration',
    icon: 'inv_axe_114',
  },
  // Unholy:
  FESTERING_SCYTHE: {
    id: 458128,
    name: 'Festering Scythe',
    icon: 'inv_polearm_2h_mawnecromancerboss_d_01_darkblue',
    runesCost: 2,
    runicPowerCost: -20,
  },

  DEATH_CHARGE: {
    id: 444347,
    name: 'Death Charge',
    icon: 'ability_mount_steelwarhorse',
  },

  MOGRAINES_MIGHT: {
    id: 444505,
    name: "Mograine's Might",
    icon: 'ability_warlock_improvedsoulleech',
  },

  GHOULISH_FRENZY: {
    id: 377588,
    name: 'Ghoulish Frenzy',
    icon: 'ability_warlock_baneofhavoc',
  },

  UNHOLY_COMMANDER: {
    id: 456698,
    name: 'Unholy Commander',
    icon: 'spell_shadow_darksummoning',
  },

  APOCALYPSE_RUNE_GENERATION: {
    id: 343758,
    name: 'Apocalypse',
    icon: 'artifactability_unholydeathknight_deathsembrace',
  },

  COMMANDER_OF_THE_DEAD_BUFF: {
    id: 390264,
    name: 'Commander of the Dead',
    icon: 'spell_shadow_fumble',
  },

  MAGUS_SUMMON: {
    id: 317776,
    name: 'Army of the Damned',
    icon: '"artifactability_unholydeathknight_deathsembrace',
  },

  APOC_SUMMON: {
    id: 275430,
    name: 'Army of the Dead',
    icon: 'artifactability_unholydeathknight_deathsembrace',
  },

  ARMY_SUMMON: {
    id: 42651,
    name: 'Army of the Dead',
    icon: 'spell_shadow_coneofsilence',
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
    runesCost: 1,
    runicPowerCost: -10,
  },

  RUNIC_CORRUPTION: {
    id: 51460,
    name: 'Runic Corruption',
    icon: 'spell_shadow_rune',
  },

  PLAGUEBRINGER_BUFF: {
    id: 390178,
    name: 'Plaguebringer',
    icon: 'spell_deathknight_plaguestrike',
  },

  // scourge strike has one cast event but two damage events, the cast and physical
  // damage happen on id 55090 (talent), the shadow damage is on id 70890
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

  DARK_ARBITER_TALENT_GLYPH: {
    id: 207349,
    name: 'Dark Arbiter',
    icon: 'achievement_boss_svalasorrowgrave',
  },

  EPIDEMIC: {
    id: 207317,
    name: 'Epidemic',
    icon: 'spell_nature_nullifydisease',
  },

  EPIDEMIC_DAMAGE: {
    id: 212739,
    name: 'Epidemic',
    icon: 'spell_nature_nullifydisease',
  },

  SOUL_REAPER_TALENT_SECOND_HIT: {
    id: 343295,
    name: 'Soul Reaper',
    icon: 'ability_deathknight_soulreaper',
  },

  SUDDEN_DOOM_BUFF: {
    id: 81340,
    name: 'Sudden Doom',
    icon: 'spell_shadow_painspike',
  },

  // Shared:
  CHAINS_OF_ICE: {
    id: 45524,
    name: 'Chains of Ice',
    icon: 'spell_frost_chainsofice',
    runesCost: 1,
    runicPowerCost: -10,
  },
  RUNEFORGING: {
    id: 53428,
    name: 'Runeforging',
    icon: 'spell_deathknight_frozenruneweapon',
  },
  //Rune of the Fallen Crusader Proc
  UNHOLY_STRENGTH_BUFF: {
    id: 53365,
    name: 'Unholy Strength',
    icon: 'spell_holy_blessingofstrength',
  },

  //Rune of Unending Thirst Proc
  RUNE_OF_UNENDING_THIRST_BUFF: {
    id: 326984,
    name: 'Rune of Unending Thirst',
    icon: 'spell_nzinsanity_bloodthirst',
  },

  //Rune of Spellwarding
  RUNE_OF_SPELLWARDING_BUFF_SHIELD: {
    id: 326867,
    name: 'Rune of Spellwarding',
    icon: 'spell_fire_twilightfireward',
  },

  //Rune of Sanguination
  RUNE_OF_SANGUINATION_BUFF_HEAL: {
    id: 326808,
    name: 'Rune of Sanguination',
    icon: 'ability_argus_deathfog',
  },

  //Rune of Hysteria RP Buff
  RUNE_OF_HYSTERIA_BUFF: {
    id: 326918,
    name: 'Rune of Hysteria',
    icon: 'ability_deathknight_runicimpowerment',
  },

  ANTI_MAGIC_SHELL: {
    id: 48707,
    name: 'Anti-Magic Shell',
    icon: 'spell_shadow_antimagicshell.jpg',
  },
  ANTI_MAGIC_ZONE_TALENT_BUFF: {
    id: 145629,
    name: 'Anti-Magic Zone',
    icon: 'spell_deathknight_antimagiczone',
  },

  ANTI_MAGIC_SHELL_RP_GAINED: {
    id: 49088,
    name: 'Anti-Magic Shell',
    icon: 'spell_holy_righteousnessaura',
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

  DEATH_AND_DECAY: {
    id: 43265,
    name: 'Death and Decay',
    icon: 'spell_shadow_deathanddecay',
    runesCost: 1,
    runicPowerCost: -10,
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

  UNHOLY_GROUND_HASTE_BUFF: {
    id: 374271,
    name: 'Unholy Ground',
    icon: 'ability_deathknight_desecratedground',
  },

  DEATH_STRIKE_HEAL: {
    id: 45470,
    name: 'Death Strike',
    icon: 'spell_deathknight_butcher2',
  },

  DEATH_GATE: {
    id: 50977,
    name: 'Death Gate',
    icon: 'spell_arcane_teleportundercity',
  },

  DEATHS_ADVANCE: {
    id: 48265,
    name: "Death's Advance",
    icon: 'spell_shadow_demonicempathy',
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

  DEATH_COIL: {
    id: 47541,
    name: 'Death Coil',
    icon: 'spell_shadow_deathcoil',
    runicPowerCost: 30,
  },

  DEATH_COIL_DAMAGE: {
    id: 47632,
    name: 'Death Coil',
    icon: 'spell_shadow_deathcoil',
  },

  LICHBORNE: {
    id: 49039,
    name: 'Lichborne',
    icon: 'spell_shadow_raisedead',
  },

  ABOMINATION_LIMB_GRIP_TICK: {
    id: 383312,
    name: 'Abomination Limb',
    icon: 'ability_maldraxxus_deathknight',
  },

  ABOMINATION_LIMB_TICK: {
    id: 383313,
    name: 'Abomination Limb',
    icon: 'ability_maldraxxus_deathknight',
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

  RUNIC_POWER: {
    id: 189096,
    name: 'Runic Power',
    icon: 'inv_sword_62',
  },
} satisfies Record<string, Spell>;

const runeforges = {
  RUNE_OF_THE_FALLEN_CRUSADER: {
    id: 53344,
    name: 'Rune of the Fallen Crusader',
    icon: 'spell_holy_retributionaura',
    effectId: 3368,
  },

  RUNE_OF_RAZORICE: {
    id: 53343,
    name: ' Rune of Razorice',
    icon: 'spell_frost_frostarmor',
    effectId: 3370,
  },

  RUNE_OF_THE_STONESKIN_GARGOYLE: {
    id: 62158,
    name: 'Rune of the Stoneskin Gargoyle',
    icon: 'inv_sword_130',
    effectId: 3847,
  },

  RUNE_OF_HYSTERIA: {
    id: 326911,
    name: 'Rune of Hysteria',
    icon: 'ability_deathknight_runicimpowerment',
    effectId: 6243,
  },

  RUNE_OF_SANGUINATION: {
    id: 326805,
    name: 'Rune of Sanguination',
    icon: 'ability_argus_deathfog',
    effectId: 6241,
  },

  RUNE_OF_APOCALYPSE: {
    id: 327082,
    name: 'Rune of Apocalypse',
    icon: 'spell_deathknight_thrash_ghoul',
    effectId: 6245,
  },

  RUNE_OF_UNENDING_THIRST: {
    id: 326977,
    name: 'Rune of Unending Thirst',
    icon: 'spell_nzinsanity_bloodthirst',
    effectId: 6244,
  },

  RUNE_OF_SPELLWARDING: {
    id: 326855,
    name: 'Rune of Spellwarding',
    icon: 'spell_fire_twilightfireward',
    effectId: 6242,
  },
} satisfies Record<string, Enchant>;

const joined = {
  ...spells,
  ...runeforges,
} as const;

export default joined;
