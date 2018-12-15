/**
 * All Hunter azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  //Beast Mastery
  HAZE_OF_RAGE: {
    id: 273262,
    name: 'Haze of Rage',
    icon: 'ability_druid_ferociousbite',
  },
  HAZE_OF_RAGE_BUFF: {
    id: 273264,
    name: 'Haze of Rage',
    icon: 'ability_druid_ferociousbite',
  },
  DANCE_OF_DEATH: {
    id: 274441,
    name: 'Dance of Death',
    icon: 'ability_druid_mangle',
  },
  DANCE_OF_DEATH_BUFF: {
    id: 274443,
    name: 'Dance of Death',
    icon: 'ability_druid_mangle',
  },
  FEEDING_FRENZY: {
    id: 278529,
    name: 'Feeding Frenzy',
    icon: 'ability_hunter_barbedshot',
  },
  PRIMAL_INSTINCTS: {
    id: 279806,
    name: 'Primal Instincts',
    icon: 'spell_nature_protectionformnature',
  },
  PRIMAL_INSTINCTS_BUFF: {
    id: 279810,
    name: 'Primal Instincts',
    icon: 'spell_nature_protectionformnature',
  },

  //Marksmanship
  STEADY_AIM: {
    id: 277651,
    name: 'Steady Aim',
    icon: 'inv_spear_07',
  },
  STEADY_AIM_DEBUFF: {
    id: 277959,
    name: 'Steady Aim',
    icon: 'inv_spear_07',
  },

  //Survival
  WILDERNESS_SURVIVAL: {
    id: 278532,
    name: 'Wilderness Survival',
    icon: 'ability_hunter_survivalinstincts',
  },
  LATENT_POISON: {
    id: 273283,
    name: 'Latent Poison',
    icon: 'spell_hunter_exoticmunitions_poisoned',
  },
  LATENT_POISON_DEBUFF: {
    id: 273286,
    name: 'Latent Poison',
    icon: 'spell_nature_corrosivebreath',
  },
  BLUR_OF_TALONS: {
    id: 277653,
    name: 'Blur of Talons',
    icon: 'inv_coordinatedassault',
  },
  BLUR_OF_TALONS_BUFF: {
    id: 277969,
    name: 'Blur of Talons',
    icon: 'inv_coordinatedassault',
  },
};
