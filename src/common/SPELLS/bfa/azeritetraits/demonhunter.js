/**
 * All Demon Hunter azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  //Havoc
  FURIOUS_GAZE: {
    id: 273231,
    name: 'Furious Gaze',
    icon: 'ability_demonhunter_eyebeam',
  },
  FURIOUS_GAZE_BUFF: {
    id: 273232,
    name: 'Furious Gaze',
    icon: 'ability_demonhunter_eyebeam',
  },
  EYES_OF_RAGE: {
    id: 278500,
    name: 'Eyes of Rage',
    icon: 'spell_warlock_soulburn',
  },
  CHAOTIC_TRANSFORMATION: {
    id: 288754,
    name: 'Chaotic Transformation',
    icon: 'ability_demonhunter_glide',
  },
  REVOLVING_BLADES: {
    id: 279581,
    name: 'Revolving Blades',
    icon: 'ability_demonhunter_bladedance',
  },
  REVOLVING_BLADES_BUFF: {
    id: 279584,
    name: 'Revolving Blades',
    icon: 'ability_demonhunter_bladedance',
  },
  THIRSTING_BLADES: {
    id: 278493,
    name: 'Thirsting Blades',
    icon: 'ability_demonhunter_chaosstrike',
  },
  THIRSTING_BLADES_BUFF: {
    id: 278736,
    name: 'Thirsting Blades',
    icon: 'ability_demonhunter_chaosstrike',
  },

  // Vengeance
  REVEL_IN_PAIN: {
    id: 272983,
    name: 'Revel in Pain',
    icon: 'ability_demonhunter_fierybrand',
  },
  REVEL_IN_PAIN_BUFF: {
    id: 272987,
    name: 'Revel in Pain',
    icon: 'ability_demonhunter_fierybrand',
  },

  //Shared
  INFERNAL_ARMOR: {
    id: 273236,
    name: 'Infernal Armor',
    icon: 'ability_demonhunter_immolation',
  },
  INFERNAL_ARMOR_BUFF: {
    id: 273238,
    name: 'Infernal Armor',
    icon: 'ability_demonhunter_immolation',
  },
  INFERNAL_ARMOR_DAMAGE: {
    id: 273239,
    name: 'Infernal Armor',
    icon: 'ability_demonhunter_immolation',
  },
};
