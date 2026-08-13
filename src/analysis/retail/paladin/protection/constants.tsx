import spells from './spells';
import SPELLS from 'common/SPELLS/paladin';
import TALENTS from 'common/TALENTS/paladin';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';

/**
 * Sentinel is a talent replacement for Avenging Wrath rather than an extra cooldown, so
 * anything gated on "during wings" has to resolve to whichever the player actually took.
 * Hard-coding Avenging Wrath turns every such check into a silent no-op for Sentinel builds.
 *
 * Returns undefined if the player has neither.
 */
export function getWingsSpell(combatant: Combatant): Spell | undefined {
  if (combatant.hasTalent(spells.SENTINEL_TALENT)) {
    return spells.SENTINEL_TALENT;
  }
  if (combatant.hasTalent(spells.AVENGING_WRATH_TALENT)) {
    return spells.AVENGING_WRATH_TALENT;
  }
  return undefined;
}

export const HOLY_POWER_BUILDERS: Spell[] = [
  SPELLS.JUDGMENT_HP_ENERGIZE,
  spells.CRUSADER_STRIKE,
  spells.HAMMER_OF_THE_RIGHTEOUS_TALENT,
  spells.BLESSED_HAMMER_TALENT,
  spells.DIVINE_TOLL_TALENT,
  TALENTS.HAMMER_OF_WRATH_TALENT,
  SPELLS.HAMMER_OF_WRATH_CAST,
];
