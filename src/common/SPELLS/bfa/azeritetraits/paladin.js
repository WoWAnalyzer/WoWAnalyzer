/**
 * All Paladin azerite powers go in here.
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */

export default {
  STALWART_PROTECTOR: {
    id: 274395,
    name: 'Stalwart Protector',
    icon: 'spell_holy_divineshield',
  },
  RADIANT_INCANDESCENCE: {
    id: 278147,
    name: 'Radiant Incandescence',
    icon: 'spell_holy_searinglight',
  },

  // Holy
  GRACE_OF_THE_JUSTICAR: {
    id: 278785,
    name: 'Grace of the Justicar',
    icon: 'spell_holy_healingaura',
  },

  // Retribution
  EXPURGATION: {
    id: 273473,
    name: 'Expurgation',
    icon: 'ability_paladin_bladeofjustice',
  },
  RELENTLESS_INQUISITOR: {
    id: 278617,
    name: 'Relentless Inquisitor',
    icon: 'spell_holy_divinepurpose',
  },
  AVENGERS_MIGHT: {
    id: 272898,
    name: `Avenger's Might`,
    icon: 'spell_holy_avenginewrath',
  },
  INDOMITABLE_JUSTICE: {
    id: 275496,
    name: 'Indomitable Justice',
    ïcon: 'spell_holy_righteousfury',
  },
  LIGHTS_DECREE: {
    id: 286229,
    name: `Light's Decree`,
    icon: 'spell_holy_blessedresillience',
  },
  EMPYREAN_POWER: {
    id: 286390,
    name: 'Empyrean_power',
    icon: 'ability_paladin_sheathoflight',
  },

  // Retribution Trait Effects
  EXPURGATION_DAMAGE: {
    id: 273481,
    name: 'Expurgation',
    icon: 'ability_paladin_bladeofjustice',
  },
  RELENTLESS_INQUISITOR_BUFF: {
    id: 279204,
    name: 'Relentless Inquisitor',
    icon: 'spell_holy_divinepurpose',
  },
  AVENGERS_MIGHT_BUFF: {
    id: 272903,
    name: `Avenger's Might`,
    icon: 'spell_holy_avenginewrath',
  },
  LIGHTS_DECREE_DAMAGE: {
    id: 286232,
    name: `Light's Decree`,
    icon: 'spell_holy_blessedresillience',
  },
  EMPYREAN_POWER_BUFF: {
    id: 286393,
    name: 'Empyrean Power',
    icon: 'ability_paladin_sheathoflight',
  },

  // Protection
  INSPIRING_VANGUARD: {
    id: 278609,
    name: 'Inspiring Vanguard',
    icon: 'inv_helmet_74',
  },
  INSPIRING_VANGUARD_BUFF: {
    id: 279397,
    name: 'Inspiring Vanguard',
    icon: 'inv_helmet_74',
  },
};
