const legendaries = {
  //region Assassination
  DASHING_SCOUNDREL: {
    id: 340426,
    bonusID: 7115,
    name: 'Dashing Scoundrel',
    icon: 'ability_rogue_venomouswounds',
  },
  DOOMBLADE: {
    id: 340082,
    bonusID: 7116,
    name: 'Doomblade',
    icon: 'ability_deathwing_bloodcorruption_earth',
  },
  DUSKWALKERS_PATCH: {
    id: 340084,
    bonusID: undefined,
    name: "DuskwalKer's Patch",
    icon: 'inv_throwingknife_04',
  },
  ZOLDYCK_INSIGNIA: {
    id: 340083,
    bonusID: 7117,
    name: 'Zoldyck Insignia',
    icon: 'archaeology_5_0_thunderkinkinsignia',
  },
  //endregion

  //region Outlaw
  CELERITY: {
    id: 340087,
    bonusID: 7121,
    name: 'Celerity',
    icon: 'ability_rogue_slicedice',
  },
  CONCEALED_BLUNDERBUSS: {
    id: 340088,
    bonusID: 7122,
    name: 'Concealed Blunderbuss',
    icon: 'inv_weapon_rifle_20',
  },
  GREENSKINS_WICKERS: {
    id: 340085,
    bonusID: 7119,
    name: "Greenskin's Wickers",
    icon: 'ability_creature_cursed_04',
  },
  GREENSKINS_WICKERS_BUFF: {
    id: 340573,
    name: "Greenskin's Wickers",
    icon: 'ability_creature_cursed_04',
  },
  GUILE_CHARM: {
    id: 340086,
    bonusID: 7120,
    name: 'Guile Charm',
    icon: 'ability_rogue_preyontheweak',
  },
  SHALLOW_INSIGHT_BUFF: {
    id: 340582,
    name: 'Shallow Insight',
    icon: 'inv_bijou_green',
  },
  MODERATE_INSIGHT_BUFF: {
    id: 340583,
    name: 'Moderate Insight',
    icon: 'inv_bijou_yellow',
  },
  DEEP_INSIGHT_BUFF: {
    id: 340584,
    name: 'Deep Insight',
    icon: 'inv_bijou_red',
  },
  //endregion

  //region Subtlety
  AKAARIS_SOUL_FRAGMENT: {
    id: 340090,
    bonusID: 7124,
    name: "Akaari's Soul Fragment",
    icon: 'ability_warlock_soullink',
  },
  AKAARIS_SOUL_FRAGMENT_SHADOWSTRIKE: {
    id: 345121,
    name: 'Shadowstrike',
    icon: 'ability_rogue_shadowstrike',
  },
  DEATHLY_SHADOWS: {
    id: 340092,
    bonusID: 7126,
    name: 'Deathly Shadows',
    icon: 'spell_nzinsanity_chasedbyshadows',
  },
  FINALITY: {
    id: 340089,
    bonusID: 7123,
    name: 'Finality',
    icon: 'ability_rogue_eviscerate',
  },
  THE_ROTTEN: {
    id: 340091,
    bonusID: 7125,
    name: 'The Rotten',
    icon: 'spell_shadow_nightofthedead',
  },
  //endregion

  //region Shared
  ESSENCE_OF_BLOODFANG: {
    id: 340079,
    bonusID: 7113,
    name: 'Essence of Bloodfang',
    icon: 'spell_shadow_lifedrain',
  },
  ESSENCE_OF_BLOODFANG_BUFF: {
    id: 340424,
    name: 'Essence of Bloodfang',
    icon: 'spell_shadow_lifedrain',
  },
  INVIGORATING_SHADOWDUST: {
    id: 340080,
    bonusID: 7114,
    name: 'Invigorating Shadowdust',
    icon: 'ability_vanish',
  },
  MARK_OF_THE_MASTER_ASSASSIN: {
    id: 340076,
    bonusID: 7111,
    name: 'Mark of the Master Assassin',
    icon: 'inv_weapon_shortblade_25',
  },
  TINY_TOXIC_BLADES: {
    id: 340078,
    bonusID: 7112,
    name: 'Tiny Toxic Blades',
    icon: 'ability_rogue_poisoned_knife',
  },
  //endregion
} as const;
export default legendaries;
