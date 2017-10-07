/**
 * All Hunter abilities except talents go in here. You can also put a talent in here if you want to override something imported in the `./talents` folder, but that should be extremely rare.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  // Beast Mastery:
  // ...
  // -------------
  // Marksmanship:
  // -------------

  // Marksmanship spells

  WINDBURST: {
    id: 204147,
    name: 'Windburst',
    icon: 'inv_bow_1h_artifactwindrunner_d_02',
  },
  WINDBURST_MOVEMENT_SPEED: {
    id: 204477,
    name: 'Windburst',
    icon: 'ability_hunter_focusedaim',
  },
  AIMED_SHOT: {
    id: 19434,
    name: 'Aimed Shot', //TODO: T204p cost reduction (46 focus instead of 50)
    icon: 'inv_spear_07',
  },
  ARCANE_SHOT: {
    id: 185358,
    name: 'Arcane Shot',
    icon: 'ability_impalingbolt',
  },
  MARKED_SHOT: {
    id: 185901,
    name: 'Marked Shot',
    icon: 'ability_hunter_markedshot',
  },
  DISENGAGE: {
    id: 781,
    name: 'Disengage',
    icon: 'ability_rogue_feint',
  },
  TRUESHOT: {
    id: 193526,
    name: 'Trueshot',
    icon: 'ability_trueshot',
  },
  MULTISHOT: {
    id: 2643,
    name: 'Multi-Shot',
    icon: 'ability_upgrademoonglaive',
  },
  EXHILARATION: {
    id: 109304,
    name: 'Exhilaration',
    icon: 'ability_hunter_onewithnature',
  },
  ASPECT_OF_THE_CHEETAH: {
    id: 186257,
    name: 'Aspect of the Cheetah',
    icon: 'ability_mount_jungletiger',
  },
  ASPECT_OF_THE_TURTLE: {
    id: 186265,
    name: 'Aspect of the Turtle',
    icon: 'ability_hunter_pet_turtle',
  },
  BURSTING_SHOT: {
    id: 224729,
    name: 'Bursting Shot',
    icon: 'ability_hunter_burstingshot',
  },
  CONCUSSIVE_SHOT: {
    id: 27634,
    name: 'Concussive Shot',
    icon: 'spell_frost_stun',
  },
  COUNTER_SHOT: {
    id: 147362,
    name: 'Counter Shot',
    icon: 'inv_ammo_arrow_03',
  },
  MISDIRECTION: {
    id: 34477,
    name: 'Misdrection',
    icon: 'ability_hunter_misdirection',
  },
  FREEZING_TRAP: {
    id: 187650,
    name: 'Freezing Trap',
    icon: 'spell_frost_chainsofice',
  },
  TAR_TRAP: {
    id: 187698,
    name: 'Tar Trap',
    icon: 'spell_yorsahj_bloodboil_black',
  },
  VULNERABLE: {
    id: 187131,
    name: 'Vulnerable',
    icon: 'ability_hunter_mastermarksman',
  },

  // Marksmanship tier sets
  HUNTER_MM_T20_2P_BONUS: {
    id: 242242,
    name: 'T20 2 set bonus',
    icon: 'ability_hunter_focusedaim',
  },
  HUNTER_MM_T20_2P_BONUS_BUFF: {
    id: 242243,
    name: 'T20 2 set bonus',
    icon: 'inv_misc_ammo_arrow_03',
  },
  HUNTER_MM_T20_4P_BONUS: {
    id: 242241,
    name: 'T20 4 set bonus',
    icon: 'ability_hunter_focusedaim',
  },
  HUNTER_MM_T20_4P_BONUS_BUFF: {
    id: 246153,
    name: 'T20 4 set bonus',
    icon: 'inv_spear_07',
  },

  // Marksmanship artifact traits
  BULLSEYE_BUFF: {
    id: 204090,
    name: 'Bullseye',
    icon: 'ability_hunter_focusedaim',
  },
  QUICK_SHOT_TRAIT: {
    id: 190462,
    name: 'Quick shot',
    icon: 'ability_trueshot',
  },

  CYCLONIC_BURST_TRAIT: {
    id: 238124,
    name: 'Cyclonic burst',
    icon: 'inv_bow_1h_artifactwindrunner_d_02',
  },

  // Survival:
  // ...


  // Shared:
  // ...
  NETHERWINDS: {
    id: 160452,
    name: 'Netherwinds',
    icon: 'spell_arcane_massdispel',
  },
  ANCIENT_HYSTERIA: {
    id: 90355,
    name: 'Ancient Hysteria',
    icon: 'spell_shadow_unholyfrenzy',
  },
};
