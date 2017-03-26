export const HOLY_SHOCK_SPELL_ID = 25914;
export const LIGHT_OF_DAWN_SPELL_ID = 225311;
export const HOLY_LIGHT_SPELL_ID = 82326;
export const FLASH_OF_LIGHT_SPELL_ID = 19750;
export const LIGHT_OF_THE_MARTYR_SPELL_ID = 183998;
export const HOLY_PRISM_SPELL_ID = 114852;
export const LIGHTS_HAMMER_SPELL_ID = 119952;
export const TYRS_DELIVERANCE_SPELL_ID = 200654;
export const BESTOW_FAITH_SPELL_ID = 223306;
export const JUDGMENT_OF_LIGHT_SPELL_ID = 183811;
export const AURA_OF_MERCY_SPELL_ID = 210291;
export const LEECH_SPELL_ID = 143924;
export const AURA_OF_SACRIFICE_SPELL_ID = 210383;

// All beacons use this spell id for their healing events.
export const BEACON_TRANSFER_SPELL_ID = 53652;

export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  HOLY_SHOCK_SPELL_ID,
  LIGHT_OF_DAWN_SPELL_ID,
  FLASH_OF_LIGHT_SPELL_ID,
  HOLY_SHOCK_SPELL_ID,
  JUDGMENT_OF_LIGHT_SPELL_ID,
  LIGHT_OF_THE_MARTYR_SPELL_ID,
  TYRS_DELIVERANCE_SPELL_ID,
  LIGHTS_HAMMER_SPELL_ID,
  HOLY_PRISM_SPELL_ID,
  AURA_OF_MERCY_SPELL_ID,
  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  BEACON_TRANSFER_SPELL_ID,
  LEECH_SPELL_ID,
  // AURA_OF_SACRIFICE_SPELL_ID, // while AoS sorta is included, it's based on effective healing and any overhealing from the original spell would have to be reduced to get an accurate result. Not including it doesn't have a big impact.
];

export const RULE_OF_LAW_SPELL_ID = 214202;

export const BEACON_OF_FAITH_SPELL_ID = 156910;
export const BEACON_OF_THE_LIGHTBRINGER_SPELL_ID = 197446;
export const BEACON_OF_VIRTUE_SPELL_ID = 200025;

export const ABILITIES_AFFECTED_BY_MASTERY = [
  HOLY_SHOCK_SPELL_ID,
  LIGHT_OF_DAWN_SPELL_ID,
  HOLY_LIGHT_SPELL_ID,
  FLASH_OF_LIGHT_SPELL_ID,
  LIGHT_OF_THE_MARTYR_SPELL_ID,
  HOLY_PRISM_SPELL_ID,
  LIGHTS_HAMMER_SPELL_ID,
  JUDGMENT_OF_LIGHT_SPELL_ID,
  TYRS_DELIVERANCE_SPELL_ID,
  BESTOW_FAITH_SPELL_ID,
];

export const BEACON_TRANSFERING_ABILITIES = {
  [HOLY_SHOCK_SPELL_ID]: 1,
  [LIGHT_OF_DAWN_SPELL_ID]: 0.5,
  [HOLY_LIGHT_SPELL_ID]: 1,
  [FLASH_OF_LIGHT_SPELL_ID]: 1,
  [HOLY_PRISM_SPELL_ID]: 0.5,
  [LIGHTS_HAMMER_SPELL_ID]: 0.5,
  [TYRS_DELIVERANCE_SPELL_ID]: 1,
  [BESTOW_FAITH_SPELL_ID]: 1,
  // While this only beacon transfers with Maraad's, adding it by default shouldn't interfere with anything
  [LIGHT_OF_THE_MARTYR_SPELL_ID]: 1,
};

export const BEACON_TYPES = {
  BEACON_OF_FATH: BEACON_OF_FAITH_SPELL_ID,
  BEACON_OF_THE_LIGHTBRINGER: BEACON_OF_THE_LIGHTBRINGER_SPELL_ID,
  BEACON_OF_VIRTUE: BEACON_OF_VIRTUE_SPELL_ID,
};
export const TRAITS = {
  SHOCK_TREATMENT: 200315,
};
export const HIT_TYPES = {
  NORMAL: 1,
  CRIT: 2,
  NOCLUEWHATTHISIS: 3, // seen at Aura of Sacrifice
};

export const AVENGING_WRATH_SPELL_ID = 31842;
export const AVENGING_WRATH_HEALING_INCREASE = 0.35;
