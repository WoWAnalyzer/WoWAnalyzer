/**
 * All Rogue azerite powers go in here.  
 * You need to do this manually, usually an easy way to do this is by opening a WCL report and clicking the icons of spells to open the relevant Wowhead pages, here you can get the icon name by clicking the icon, copy the name of the spell and the ID is in the URL.
 * You can access these entries like other entries in the spells files by importing `common/SPELLS` and using the assigned property on the SPELLS object. Please try to avoid abbreviating properties.
 */
export default {
  //Outlaw Specific Traits
  ACE_UP_YOUR_SLEEVE: {
    id: 278676,
    name: 'Ace Up Your Sleeve',
    icon: 'inv_weapon_rifle_01',
  },
  ACE_UP_YOUR_SLEEVE_BUFF: { // This appears to be what actually generates the combo points
    id: 279714,
    name: 'Ace Up Your Sleeve',
    icon: 'inv_weapon_rifle_01',
  },
  DEADSHOT: {
    id: 272935,
    name: 'Deadshot',
    icon: 'ability_rogue_pistolshot',
  },
  BRIGANDS_BLITZ: {
    id: 277676,
    name: 'Brigand\'s Blitz',
    icon: 'spell_shadow_shadowworddominate',
  },
  KEEP_YOUR_WITS_ABOUT_YOU: {
    id: 288985,
    name: 'Keep Your Wits About You',
    icon: 'ability_warrior_punishingblow',
  },
  PARADISE_LOST: {
    id: 278675,
    name: 'Paradise Lost',
    icon: 'ability_rogue_rollthebones',
  },
  SNAKE_EYES: {
    id: 275863,
    name: 'Snake Eyes',
    icon: 'ability_rogue_rollthebones',
  },

  //Assasination Specific Traits
  SHROUDED_SUFFOCATION: {
    id: 279703,
    name: 'Shrouded Suffocation',
    icon: 'ability_rogue_garrote',
  },
  DOUBLE_DOSE: {
    id: 273009,
    name: 'Double Dose',
    icon: 'ability_rogue_shadowstrikes',
  },
  NOTHING_PERSONAL: {
    id: 286573,
    name: 'Nothing Personal',
    icon: 'ability_rogue_deadliness',
  },
  TWIST_THE_KNIFE: {
    id: 273488,
    name: 'Twist The Knife',
    icon: 'ability_rogue_disembowel',
  },
  ECHOING_BLADES: {
    id: 287649,
    name: 'Echoing Blades',
    icon: 'ability_rogue_fanofknives',
  },
  //Subtlety Specific Traits
  PERFORATE: {
    id: 277673,
    name: 'Perforate',
    icon: 'ability_backstab',
  },
  THE_FIRST_DANCE: {
    id: 278981,
    name: 'The First Dance',
    icon: 'ability_rogue_shadowdance',
  },
  BLADE_IN_THE_SHADOWS: {
    id: 275896,
    name: 'Blade In The Shadows',
    icon: 'ability_rogue_shadowstrike',
  },
  NIGHTS_VENGEANCE: {
    id: 273419,
    name: 'Night\'s Vengeance',
    icon: 'ability_rogue_nightblade',
  },
  REPLICATING_SHADOWS: {
    id: 286121,
    name: 'Replicating Shadows',
    icon: 'spell_deathknight_strangulate',
  },
  INEVITABILITY: {
    id: 278683,
    name: 'Inevitability',
    icon: 'spell_shadow_rune',
  },
};
