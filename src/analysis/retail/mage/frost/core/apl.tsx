import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { suggestion as buildSuggestion } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import aplCheck, { build, Condition } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';

const precastFrostbolt: Condition<{ brainFreeze?: number; frostbolt?: number }> = {
  key: 'precast-frostbolt',
  init: () => ({}),
  update: (state, event) => {
    if (
      event.type === EventType.ApplyBuff &&
      event.ability.guid === TALENTS.BRAIN_FREEZE_TALENT.id
    ) {
      state.brainFreeze = event.timestamp;
    }

    if (
      event.type === EventType.RemoveBuff &&
      event.ability.guid === TALENTS.BRAIN_FREEZE_TALENT.id
    ) {
      state.brainFreeze = undefined;
    }

    if (event.type === EventType.Cast && event.ability.guid === SPELLS.FROSTBOLT.id) {
      state.frostbolt = event.timestamp;
    }

    return state;
  },
  validate: (state, _event) => {
    if (!state.brainFreeze) {
      return false;
    }

    // if brain freeze is up, did the previous cast overlap sufficiently?
    if ((state.frostbolt || 0) > state.brainFreeze + 500) {
      return false;
    }

    // otherwise, brain freeze is up and the previous frostbolt doesn't count
    return true;
  },
  describe: () => (
    <>
      <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> was just applied
    </>
  ),
};

export const apl = build([
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: cnd.debuffPresent(SPELLS.WINTERS_CHILL),
  },
  {
    spell: SPELLS.FROSTBOLT,
    condition: cnd.and(precastFrostbolt),
  },
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: cnd.buffPresent(TALENTS.BRAIN_FREEZE_TALENT),
  },
  { spell: TALENTS.ICE_LANCE_TALENT, condition: cnd.buffPresent(TALENTS.FINGERS_OF_FROST_TALENT) },
  TALENTS.FROZEN_ORB_TALENT,
  SPELLS.FROSTBOLT,
]);

export const check = aplCheck(apl);

export default buildSuggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
