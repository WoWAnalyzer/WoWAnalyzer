import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Combatant from 'parser/core/Combatant';

export const ABILITIES_AFFECTED_BY_HEALING_INCREASES = [
  SPELLS.HOLY_SHOCK_HEAL.id,
  SPELLS.LIGHT_OF_DAWN_HEAL.id,
  SPELLS.FLASH_OF_LIGHT.id,
  SPELLS.JUDGMENT_OF_LIGHT_HEAL.id,
  SPELLS.LIGHT_OF_THE_MARTYR.id,
  SPELLS.LIGHTS_HAMMER_HEAL.id,
  SPELLS.HOLY_PRISM_HEAL.id,
  SPELLS.HOLY_PRISM_HEAL_DIRECT.id,
  SPELLS.AURA_OF_MERCY_HEAL.id,
  SPELLS.GLIMMER_OF_LIGHT_HEAL_TALENT.id,
  // While the following spells don't double dip in healing increases, they gain the same percentual bonus from the transfer
  SPELLS.BEACON_OF_LIGHT_HEAL.id,
  SPELLS.LEECH.id,

  // There trinkets are confirmed to also be increased:
  // Proof: https://www.warcraftlogs.com/reports/4AVZqJTgyhG2F368/#fight=46&source=4&view=events&pins=2%24Off%24%23244F4B%24auras-gained%24-1%240.0.0.Any%240.0.0.Any%24true%240.0.0.Any%24true%24216331%24true%24true see the events at 00:03:39.013 and 00:03:40.369.
  SPELLS.AVENGING_CRUSADER_HEAL_NORMAL.id,
  SPELLS.AVENGING_CRUSADER_HEAL_CRIT.id,
];

// TODO: Feed this with the SpellInfo config
export const ABILITIES_AFFECTED_BY_MASTERY = [
  SPELLS.HOLY_SHOCK_HEAL.id,
  SPELLS.LIGHT_OF_DAWN_HEAL.id,
  SPELLS.FLASH_OF_LIGHT.id,
  SPELLS.LIGHT_OF_THE_MARTYR.id,
  SPELLS.HOLY_PRISM_HEAL.id,
  SPELLS.HOLY_PRISM_HEAL_DIRECT.id,
  SPELLS.LIGHTS_HAMMER_HEAL.id,
  SPELLS.JUDGMENT_OF_LIGHT_HEAL.id,
  SPELLS.GLIMMER_OF_LIGHT_HEAL_TALENT.id,
  SPELLS.WORD_OF_GLORY.id,
  TALENTS.HOLY_LIGHT_TALENT.id,
  TALENTS.BESTOW_FAITH_TALENT.id,
];

export const BEACON_TRANSFERING_ABILITIES = {
  [SPELLS.HOLY_SHOCK_HEAL.id]: 1,
  [SPELLS.LIGHT_OF_DAWN_HEAL.id]: 0.5,
  [SPELLS.FLASH_OF_LIGHT.id]: 1,
  [SPELLS.HOLY_PRISM_HEAL.id]: 0.5,
  [SPELLS.HOLY_PRISM_HEAL_DIRECT.id]: 1,
  [SPELLS.LIGHTS_HAMMER_HEAL.id]: 0.5,
  [SPELLS.AVENGING_CRUSADER_HEAL_NORMAL.id]: 1,
  [SPELLS.AVENGING_CRUSADER_HEAL_CRIT.id]: 1,
  [SPELLS.GLIMMER_OF_LIGHT_HEAL_TALENT.id]: 0.5,
  [SPELLS.WORD_OF_GLORY.id]: 1,
  [SPELLS.LIGHT_OF_THE_MARTYR.id]: (player: Combatant) =>
    player.hasBuff(SPELLS.MARAADS_DYING_BREATH_BUFF.id) ? 1 : undefined,
  [TALENTS.HOLY_LIGHT_TALENT.id]: 1,
  [TALENTS.BESTOW_FAITH_TALENT.id]: 1,
};

export function getBeaconSpellFactor(spellID: number, player: Combatant): number | undefined {
  const spell = BEACON_TRANSFERING_ABILITIES[spellID];
  if (!spell) {
    return undefined;
  }

  if (typeof spell === 'function') {
    return spell(player);
  }

  return spell;
}

export const BEACON_TYPES = {
  BEACON_OF_FATH: TALENTS.BEACON_OF_FAITH_TALENT.id,
  GLIMMER_OF_LIGHT_TALENT: SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF.id,
  BEACON_OF_VIRTUE: TALENTS.BEACON_OF_VIRTUE_TALENT.id,
};
