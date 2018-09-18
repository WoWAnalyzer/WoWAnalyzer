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
  CONCENTRATED_MENDING: {
    id: 272260,
    name: 'Concentrated Mending',
    icon: 'inv_offhand_1h_pvpdraenors1_d_02',
  },

  // Retribution
  EXPURGATION: {
    id: 273476,
    name: 'Expurgation',
    icon: 'ability_paladin_bladeofjustice',
  },
  RELENTLESS_INQUISITOR: {
    id: 278617,
    name: 'Relentless Inquisitor',
    icon: 'spell_holy_divinepurpose',
  },
  AVENGERS_MIGHT: {
    id: 272904,
    name: `Avenger's Might`,
    icon: 'spell_holy_avenginewrath',
  },
  INDOMITABLE_JUSTICE: {
    id: 275496,
    name: 'Indomitable Justice',
    ïcon: 'spell_holy_righteousfury',
  },
  ZEALOTRY: {
    id: 278982,
    name: 'Zealotry',
    icon: 'spell_holy_weaponmastery',
  },
  DIVINE_RIGHT: {
    id: 278519,
    name: 'Divine Right',
    icon: 'ability_paladin_divinestorm',
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
  ZEALOTRY_BUFF: {
    id: 278989,
    name: 'Zealotry',
    icon: 'spell_holy_weaponmastery',
  },
  DIVINE_RIGHT_BUFF: {
    id: 278523,
    name: 'Divine Right',
    icon: 'ability_paladin_divinestorm',
  },
};
