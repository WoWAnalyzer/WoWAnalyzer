import aplCheck, { build } from 'parser/shared/metrics/apl';
import { suggestion } from 'parser/core/Analyzer';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/demonhunter';
import SPELLS from 'common/SPELLS/demonhunter';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

export const apl = build([
  {
    spell: TALENTS.THE_HUNT_TALENT,
    condition: cnd.hasTalent(TALENTS.THE_HUNT_TALENT),
  },
  {
    spell: SPELLS.DEATH_SWEEP,
    condition: cnd.and(cnd.spellCooldownRemaining(TALENTS.ESSENCE_BREAK_TALENT, { atLeast: 3000 })),
  },
  {
    spell: TALENTS.EYE_BEAM_TALENT,
    condition: cnd.hasTalent(TALENTS.EYE_BEAM_TALENT),
  },
  {
    spell: TALENTS.ESSENCE_BREAK_TALENT,
    condition: cnd.hasTalent(TALENTS.ESSENCE_BREAK_TALENT),
  },
  {
    spell: SPELLS.METAMORPHOSIS_HAVOC,
    condition: cnd.and(
      cnd.spellCooldownRemaining(TALENTS.EYE_BEAM_TALENT, { atLeast: 1 }),
      cnd.spellCooldownRemaining(TALENTS.ESSENCE_BREAK_TALENT, { atLeast: 1 }),
      cnd.spellCooldownRemaining(SPELLS.DEATH_SWEEP, { atLeast: 1 }),
      cnd.spellCooldownRemaining(SPELLS.BLADE_DANCE, { atLeast: 1 }),
    ),
  },
  {
    spell: SPELLS.BLADE_DANCE,
    condition: cnd.and(
      cnd.spellCooldownRemaining(TALENTS.ESSENCE_BREAK_TALENT, { atLeast: 3000 }),
      cnd.spellCooldownRemaining(TALENTS.EYE_BEAM_TALENT, { atLeast: 3000 }),
    ),
  },
  SPELLS.IMMOLATION_AURA,
  { spell: SPELLS.ANNIHILATION, condition: cnd.buffPresent(SPELLS.METAMORPHOSIS_HAVOC_BUFF) },
  {
    spell: TALENTS.FELBLADE_TALENT,
    condition: cnd.and(
      cnd.hasTalent(TALENTS.FELBLADE_TALENT),
      // TODO: This needs to support the new Fury cap
      cnd.hasResource(RESOURCE_TYPES.FURY, { atMost: 70 }),
    ),
  },
  SPELLS.CHAOS_STRIKE,
  SPELLS.THROW_GLAIVE_HAVOC,
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
