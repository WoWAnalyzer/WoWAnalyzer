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
  SURGING_SHOTS: {
    id: 287707,
    name: 'Surging Shots',
    icon: 'ability_hunter_snipershot',
  },
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
  IN_THE_RHYTHM: {
    id: 264198,
    name: 'In The Rhythm',
    icon: 'ability_hunter_efficiency',
  },
  IN_THE_RHYTHM_BUFF: {
    id: 272733,
    name: 'In The Rhythm',
    icon: 'ability_hunter_efficiency',
  },
  UNERRING_VISION: {
    id: 274444,
    name: 'Unerring Vision',
    icon: 'ability_trueshot',
  },
  UNERRING_VISION_BUFF: {
    id: 274447,
    name: 'Unerring Vision',
    icon: 'ability_trueshot',
  },
  FOCUSED_FIRE: {
    id: 278531,
    name: 'Focused Fire',
    icon: 'ability_hisek_aim',
  },
  FOCUSED_FIRE_FOCUS: {
    id: 279637,
    name: 'Focused Fire',
    icon: 'ability_hisek_aim',
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
  PRIMEVAL_INTUITION: {
    id: 288570,
    name: 'Primeval Intuition',
    icon: 'ability_hunter_silenthunter',
  },
  PRIMEVAL_INTUITION_BUFF: {
    id: 288573,
    name: 'Primeval Intuition',
    icon: 'ability_hunter_silenthunter',
  },
  WILDFIRE_CLUSTER: {
    id: 272742,
    name: 'Wildfire Cluster',
    icon: 'spell_mage_flameorb',
  },
  WILDFIRE_CLUSTER_DAMAGE: {
    id: 272745,
    name: 'Wildfire Cluster',
    icon: 'spell_mage_flameorb',
  },

  // shared
  DIRE_CONSEQUENCES: {
    id: 287093,
    name: 'Dire Consequences',
    icon: 'ability_hunter_longevity',
  },
  RAPID_RELOAD: {
    id: 278530,
    name: 'Rapid Reload',
    icon: 'ability_upgrademoonglaive',
  },
  RAPID_RELOAD_DAMAGE: {
    id: 278565,
    name: 'Multi-Shot Rapid Relooad',
    icon: 'ability_upgrademoonglaive',
  },
};
