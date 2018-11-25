/**
 * All Warlock azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  EXPLOSIVE_POTENTIAL: { // buff
    id: 275398,
    name: 'Explosive Potential',
    icon: 'inv__implosion',
  },
  CASCADING_CALAMITY: {
    id: 275372,
    name: 'Cascading Calamity',
    icon: 'spell_shadow_unstableaffliction_3',
  },
  WRACKING_BRILLIANCE: {
    id: 272891,
    name: 'Wracking Brilliance',
    icon: 'spell_shadow_felmending',
  },
  DREADFUL_CALLING:{
    id: 278727,
    name: 'Dreadful Calling',
    icon: 'inv_beholderwarlock',
  },


  SHADOWS_BITE: {
    id: 272944,
    name: 'Shadow\'s Bite',
    icon: 'spell_shadow_painspike',
  },
  SHADOWS_BITE_BUFF: {
    id: 272945,
    name: 'Shadow\'s Bite',
    icon: 'spell_shadow_painspike',
  },
  FORBIDDEN_KNOWLEDGE: {
    id: 278738,
    name: 'Forbidden Knowledge',
    icon: 'inv_offhand_hyjal_d_01',
  },
  FORBIDDEN_KNOWLEDGE_BUFF: {
    id: 279666,
    name: 'Forbidden Knowledge',
    icon: 'inv_offhand_hyjal_d_01',
  },
  UMBRAL_BLAZE: {
    id: 273523,
    name: 'Umbral Blaze',
    icon: 'ability_warlock_everlastingaffliction',
  },
  UMBRAL_BLAZE_DEBUFF: {
    id: 273526,
    name: 'Umbral Blaze',
    icon: 'ability_warlock_everlastingaffliction',
  },
  SUPREME_COMMANDER: {
    id: 279878,
    name: 'Supreme Commander',
    icon: 'inv_summondemonictyrant',
  },
  SUPREME_COMMANDER_BUFF: {
    id: 279885,
    name: 'Supreme Commander',
    icon: 'inv_summondemonictyrant',
  },
};
