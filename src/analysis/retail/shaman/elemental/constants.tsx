import SPELLS from 'common/SPELLS';
import { SpellInfo } from 'parser/core/EventFilter';

export const ELEMENTAL_BLAST_BUFFS: SpellInfo[] = [
  SPELLS.ELEMENTAL_BLAST_CRIT,
  SPELLS.ELEMENTAL_BLAST_MASTERY,
  SPELLS.ELEMENTAL_BLAST_HASTE,
];

export const CRIT_MULTIPLIER = 2.5;

/**
 * Grace-period for checking if a buff is applied to the player.  Buffs that are
 * removed on-cast (SK, MotE, SoP) may get removed before the actual spell cast
 * is logged.
 */
export const ON_CAST_BUFF_REMOVAL_GRACE_MS = 50;

/**
 * Width in percentage that the explanation (the left part with text) takes up
 * in the guide section.  For use with `ExplanationAndDataSubSection`.
 */
export const GUIDE_EXPLANATION_PERCENT_WIDTH = 40;
