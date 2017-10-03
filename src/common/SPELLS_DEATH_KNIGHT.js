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
  DEATH_AND_DECAY: {
    id: 43265,
    name: 'Death and Decay',
    icon: 'spell_shadow_deathanddecay',
  },

  // Provides the 1 RP tick on DnD from Rapid Decomposition Talent
  RAPID_DECOMPOSITION_RP_TICK: {
    id: 188290,
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
  DEATH_STRIKE: {
    id: 49998,
    name: 'Death Strike',
    icon: 'spell_deathknight_butcher2',
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

  BLOODDRINKER: {
    id: 206931,
    name: 'Blooddrinker',
    icon: 'ability_animusdraw',
  },

  // Cool Downs
  ICEBOUND_FORTITUDE: {
    id: 48792,
    name: 'Icebound Fortitude',
    icon: 'spell_deathknight_iceboundfortitude',
  },

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

  BONE_SHIELD: {
    id: 195181,
    name: 'Bone Shield',
    icon: 'ability_deathknight_boneshield',
  },

  BLOOD_SHIELD: {
    id: 77513,
    name: 'Blood Shield',
    icon: 'spell_deathknight_deathstrike',
  },

  BLOOD_MIRROR: {
    id: 206977,
    name: 'Blood Mirror',
    icon: 'inv_misc_gem_bloodstone_01',
  },

  MARK_OF_BLOOD: {
    id: 61606,
    name: 'Mark of Blood',
    icon: 'ability_hunter_rapidkilling',
  },

  BONESTORM: {
    id: 194844,
    name: 'Bonestorm',
    icon: 'achievement_boss_lordmarrowgar',
  },

// Buffs
  OSSUARY: {
    id: 219788,
    name: 'OSSUARY',
    icon: 'ability_deathknight_brittlebones',
  },

  CRIMSON_SCOURGE: {
    id: 81141,
    name: 'Crimson Scourge',
    icon: 'ability_warrior_bloodnova',
  },


  // CC
  ASPHYXIATE: {
    id: 108194,
    name: 'ASPHYXIATE',
    icon: 'ability_deathknight_asphixiate',
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

  GOREFIENDS_GRASP: {
    id: 108199,
    name: 'Gorefiend\'s Grasp',
    icon: 'ability_deathknight_aoedeathgrip',
  },

  // Movement
  WRAITH_WALK: {
    id: 212552,
    name: 'Wraith Walk',
    icon: 'inv_helm_plate_raiddeathknight_p_01',
  },


  // MISC
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

  RAISE_ALLY: {
    id: 61999,
    name: 'Raise Ally',
    icon: 'spell_shadow_deadofnight',
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
  // ...

  // Unholy:
  // ...

  // Shared:
  // ...
};
