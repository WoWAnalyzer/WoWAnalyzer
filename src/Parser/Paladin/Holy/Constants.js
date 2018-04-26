import SPELLS from 'common/SPELLS';

export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  SPELLS.HOLY_SHOCK_HEAL.id,
  SPELLS.LIGHT_OF_DAWN_HEAL.id,
  SPELLS.FLASH_OF_LIGHT.id,
  SPELLS.JUDGMENT_OF_LIGHT_HEAL.id,
  SPELLS.LIGHT_OF_THE_MARTYR.id,
  SPELLS.TYRS_DELIVERANCE_HEAL.id,
  SPELLS.LIGHTS_HAMMER_HEAL.id,
  SPELLS.HOLY_PRISM_HEAL.id,
  SPELLS.AURA_OF_MERCY_HEAL.id,
  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.BEACON_OF_LIGHT_HEAL.id,
  SPELLS.LEECH.id,
  // SPELLS.AURA_OF_SACRIFICE_HEAL.id, // while AoS sorta is included, it's based on effective healing and any overhealing from the original spell would have to be reduced to get an accurate result. Not including it doesn't have a big impact.

  // There trinkets are confirmed to also be increased:
  SPELLS.OCEANS_EMBRACE.id,
  SPELLS.HIGHFATHERS_TIMEKEEPING_HEAL.id,
  // Didn't check this, but pretty sure it will work the same as the trinkets above:
  SPELLS.GUIDING_HAND.id,
];

export const ABILITIES_AFFECTED_BY_MASTERY = [
  SPELLS.HOLY_SHOCK_HEAL.id,
  SPELLS.LIGHT_OF_DAWN_HEAL.id,
  SPELLS.HOLY_LIGHT.id,
  SPELLS.FLASH_OF_LIGHT.id,
  SPELLS.LIGHT_OF_THE_MARTYR.id,
  SPELLS.HOLY_PRISM_HEAL.id,
  SPELLS.LIGHTS_HAMMER_HEAL.id,
  SPELLS.JUDGMENT_OF_LIGHT_HEAL.id,
  SPELLS.TYRS_DELIVERANCE_HEAL.id,
  SPELLS.BESTOW_FAITH_TALENT.id,
];

export const BEACON_TRANSFERING_ABILITIES = {
  [SPELLS.HOLY_SHOCK_HEAL.id]: 1,
  [SPELLS.LIGHT_OF_DAWN_HEAL.id]: 0.5,
  [SPELLS.HOLY_LIGHT.id]: 1,
  [SPELLS.FLASH_OF_LIGHT.id]: 1,
  [SPELLS.HOLY_PRISM_HEAL.id]: 0.5,
  [SPELLS.LIGHTS_HAMMER_HEAL.id]: 0.5,
  [SPELLS.TYRS_DELIVERANCE_HEAL.id]: 1,
  [SPELLS.BESTOW_FAITH_TALENT.id]: 1,
  // While this only beacon transfers with Maraad's, adding it by default shouldn't interfere with anything
  [SPELLS.LIGHT_OF_THE_MARTYR.id]: 1,
  [SPELLS.AVENGING_CRUSADER_HEAL.id]: 1,
};

export const BEACON_TYPES = {
  BEACON_OF_FATH: SPELLS.BEACON_OF_FAITH_TALENT.id,
  DIVINE_PURPOSE_TALENT_HOLY: SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id,
  BEACON_OF_VIRTUE: SPELLS.BEACON_OF_VIRTUE_TALENT.id,
};

export const AVENGING_WRATH_HEALING_INCREASE = 0.35;

export const BASE_BEACON_TRANSFER = 0.4;
export const BEACON_OF_FAITH_TRANSFER_REDUCTION = 0.2;
