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
  //Damage Dealing
  DEATH_AND_DECAY: {
    id: 43265,
    name: 'Death and Decay',
    icon: 'spell_shadow_deathanddecay',
  },

  //Free Death and Decay from Scorge Proc
  DEATH_AND_DECAY_SCORGE_PROC: {
    id: 188290,
    name: 'Free Death and Decay',
    icon: 'spell_shadow_deathanddecay',
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
  MARROWREND: {
   id: 195182,
   name: 'Marrowrend',
   icon: 'ability_deathknight_marrowrend',
  },
  DEATH_STRIKE: {
   id: 49998,
   name: 'Death Strike',
   icon: 'sspell-deathknight-butcher2',
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

  HEART_STRIKE: {
    id: 206930,
    name: 'Heart-Strike',
    icon: 'inv_weapon_shortblade_40',
  },

  MARROWREND: {
    id: 195182,
    name: 'Marrowrend',
    icon: 'ability_deathknight_marrowrend',
  },
  //Cool Downs
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

  VAMPIRIC_BLOOD: {
    id: 55233,
    name: 'Vampiric Blood',
    icon: 'spell_shadow_lifedrain',
  },

  Anti_Magic_Shell: {
    id: 48707,
    name: 'Anti-Magic Shell',
    icon: 'pell_shadow_antimagicshell',
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

//Buffs
  Ossuary: {
    id: 219788,
    name: 'Ossuary',
    icon: 'ability_deathknight_brittlebones',
  },

  CRIMSON_SCOURGE: {
    id: 81141,
    name: 'Crimson Scourge',
    icon: 'spell_deathknight_bloodboil',
  },

  // Frost:
  // ...

  // Unholy:
  // ...

  // Shared:
  // ...
};
