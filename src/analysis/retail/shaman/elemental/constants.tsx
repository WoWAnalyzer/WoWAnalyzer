import SPELLS from 'common/SPELLS/shaman';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/shaman';

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

export enum NORMALIZER_ORDER {
  EventLink = 0,
  Prepull = 10,
  EventOrder = 20,
}

export enum EVENT_LINKS {
  Stormkeeper = 'stormkeeper',
  CallOfTheAncestors = 'call-of-the-ancestor',
}

type OverloadSpell = {
  spell: Spell;
  overloadSpell: Spell;
};

export const OVERLOAD_SPELLS: OverloadSpell[] = [
  {
    spell: SPELLS.LIGHTNING_BOLT,
    overloadSpell: SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT,
  },
  {
    spell: TALENTS.CHAIN_LIGHTNING_TALENT,
    overloadSpell: SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  },
  {
    spell: SPELLS.ELEMENTAL_BLAST,
    overloadSpell: SPELLS.ELEMENTAL_BLAST_OVERLOAD,
  },
  {
    spell: TALENTS.EARTH_SHOCK_TALENT,
    overloadSpell: SPELLS.EARTH_SHOCK_OVERLOAD,
  },
  {
    spell: TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT,
    overloadSpell: SPELLS.EARTHQUAKE_OVERLOAD,
  },
  {
    spell: TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT,
    overloadSpell: SPELLS.EARTHQUAKE_OVERLOAD,
  },
  {
    spell: TALENTS.LAVA_BURST_TALENT,
    overloadSpell: SPELLS.LAVA_BURST_OVERLOAD,
  },
  {
    spell: TALENTS.TEMPEST_TALENT,
    overloadSpell: SPELLS.TEMPEST_OVERLOAD,
  },
];
