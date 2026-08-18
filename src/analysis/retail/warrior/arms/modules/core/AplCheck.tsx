import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, {
  Apl,
  build,
  CheckResult,
  Condition,
  PlayerInfo,
} from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';

export const MASSACRE_EXECUTE_THRESHOLD = 0.35;
export const DEFAULT_EXECUTE_THRESHOLD = 0.2;

export const apl = (info: PlayerInfo): Apl => {
  const executeThreshold = info.combatant.hasTalent(TALENTS.MASSACRE_SPEC_TALENT)
    ? MASSACRE_EXECUTE_THRESHOLD
    : DEFAULT_EXECUTE_THRESHOLD;
  const executeUsable = cnd.or(
    cnd.buffPresent(SPELLS.SUDDEN_DEATH_TALENT_BUFF),
    cnd.and(
      cnd.inExecute(executeThreshold),
      cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 200 }),
    ),
  );
  const executeSpell = info.combatant.hasTalent(TALENTS.MASSACRE_SPEC_TALENT)
    ? SPELLS.EXECUTE_GLYPHED
    : SPELLS.EXECUTE;

  return info.combatant.hasTalent(TALENTS.SLAYERS_DOMINANCE_TALENT)
    ? buildSlayerApl(executeThreshold, executeUsable, executeSpell)
    : buildColossusApl(executeThreshold, executeUsable, executeSpell);
};

export const buildSlayerApl = (
  executeThreshold: number,
  executeUsable: Condition<boolean>,
  executeSpell: Spell,
): Apl => {
  return build([
    // execute prio

    // HS inside execute
    {
      spell: SPELLS.HEROIC_STRIKE,
      condition: cnd.and(
        cnd.inExecute(executeThreshold),
        cnd.buffPresent(SPELLS.MASTER_OF_WARFARE),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.HEROIC_STRIKE} /> while in execute range
        </>
      ),
    },

    // MS w 2xEP inside execute
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.and(
        cnd.buffStacks(SPELLS.EXECUTIONERS_PRECISION_DEBUFF, { atLeast: 2 }),
        cnd.inExecute(executeThreshold),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> while in execute range with 2 stacks of{' '}
          <SpellLink spell={SPELLS.EXECUTIONERS_PRECISION_DEBUFF} />
        </>
      ),
    },

    // OP inside execute with 2opp
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(cnd.buffStacks(SPELLS.OPPORTUNIST, { atLeast: 2 }), executeUsable),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> while in execute range with 2 stacks of{' '}
          <SpellLink spell={SPELLS.OPPORTUNIST} />
        </>
      ),
    },

    // Exe in execute with SD
    {
      spell: executeSpell,
      condition: cnd.and(
        executeUsable,
        cnd.inExecute(executeThreshold),
        cnd.buffPresent(SPELLS.SUDDEN_DEATH_TALENT_BUFF),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> while in execute range with{' '}
          <SpellLink spell={SPELLS.SUDDEN_DEATH_TALENT_BUFF} />
        </>
      ),
    },

    // Exe in execute
    {
      spell: executeSpell,
      condition: cnd.and(
        executeUsable,
        cnd.inExecute(executeThreshold),
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 400 }),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> while in execute range with at least 40 rage
        </>
      ),
    },

    // OP inside execute
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.inExecute(executeThreshold),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> while in execute range
        </>
      ),
    },

    // outside of execute prio

    // HS
    {
      spell: SPELLS.HEROIC_STRIKE,
      condition: cnd.buffPresent(SPELLS.MASTER_OF_WARFARE),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.HEROIC_STRIKE} />
        </>
      ),
    },

    // OP  with 2opp
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.buffStacks(SPELLS.OPPORTUNIST, { atLeast: 2 }),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> with 2 stacks of{' '}
          <SpellLink spell={SPELLS.OPPORTUNIST} />
        </>
      ),
    },

    // MS outside execute
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.not(cnd.inExecute(executeThreshold)),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} />
        </>
      ),
    },

    // Exe
    {
      spell: executeSpell,
      condition: cnd.and(executeUsable),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} />
        </>
      ),
    },

    // OP outside execute
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.not(cnd.inExecute(executeThreshold)),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} />
        </>
      ),
    },

    // Slam
    {
      spell: SPELLS.SLAM,
      condition: cnd.and(cnd.not(cnd.inExecute(executeThreshold))),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.SLAM} />
        </>
      ),
    },
  ]);
};

export const buildColossusApl = (
  executeThreshold: number,
  executeUsable: Condition<boolean>,
  executeSpell: Spell,
): Apl => {
  return build([
    // execute prio

    // HS inside execute
    {
      spell: SPELLS.HEROIC_STRIKE,
      condition: cnd.and(
        cnd.inExecute(executeThreshold),
        cnd.buffPresent(SPELLS.MASTER_OF_WARFARE),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.HEROIC_STRIKE} /> while in execute range
        </>
      ),
    },

    // MS in exe
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.and(
        cnd.inExecute(executeThreshold),
        cnd.or(
          cnd.buffStacks(SPELLS.EXECUTIONERS_PRECISION_DEBUFF, { atLeast: 2 }),
          cnd.buffStacks(SPELLS.COLOSSAL_MIGHT, { atMost: 9 }),
        ),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> in execute range with 2 stacks of{' '}
          <SpellLink spell={SPELLS.EXECUTIONERS_PRECISION_DEBUFF} /> or below 10 stacks of{' '}
          <SpellLink spell={SPELLS.COLOSSAL_MIGHT} />
        </>
      ),
    },

    // Exe with SD
    {
      spell: executeSpell,
      condition: cnd.and(
        cnd.buffPresent(SPELLS.SUDDEN_DEATH_TALENT_BUFF),
        cnd.inExecute(executeThreshold),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> with{' '}
          <SpellLink spell={SPELLS.SUDDEN_DEATH_TALENT_BUFF} /> in execute range
        </>
      ),
    },

    // Exe with DW and high rage
    {
      spell: executeSpell,
      condition: cnd.and(
        cnd.inExecute(executeThreshold),
        cnd.hasTalent(TALENTS.DEEP_WOUNDS_TALENT),
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 750 }),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> with above 75 rage if{' '}
          <SpellLink spell={TALENTS.DEEP_WOUNDS_TALENT} /> is talented
        </>
      ),
    },

    // OP (in exe)
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.inExecute(executeThreshold),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> in execute range
        </>
      ),
    },

    // exe in exe
    {
      spell: executeSpell,
      condition: cnd.and(
        executeUsable,
        cnd.inExecute(executeThreshold),
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 750 }),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> in execute range while above 75 rage
        </>
      ),
    },

    // outside execute prio

    // MS below 10 CM
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.and(
        cnd.not(cnd.inExecute(executeThreshold)),
        cnd.buffStacks(SPELLS.COLOSSAL_MIGHT, { atMost: 9 }),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> while below 10 stacks of{' '}
          <SpellLink spell={SPELLS.COLOSSAL_MIGHT} />
        </>
      ),
    },

    // HS
    {
      spell: SPELLS.HEROIC_STRIKE,
      condition: cnd.buffPresent(SPELLS.MASTER_OF_WARFARE),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.HEROIC_STRIKE} />
        </>
      ),
    },

    // Exe with 2 SD
    {
      spell: executeSpell,
      condition: cnd.and(
        executeUsable,
        cnd.buffStacks(SPELLS.SUDDEN_DEATH_TALENT_BUFF, { atLeast: 2 }),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> with 2 stacks of{' '}
          <SpellLink spell={SPELLS.SUDDEN_DEATH_TALENT_BUFF} />
        </>
      ),
    },

    // MS no exe
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.not(cnd.inExecute(executeThreshold)),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} />
        </>
      ),
    },

    // Exe with SD
    {
      spell: executeSpell,
      condition: executeUsable,
      description: (
        <>
          Cast <SpellLink spell={executeSpell} />
        </>
      ),
    },

    // OP no exe
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(cnd.not(cnd.inExecute(executeThreshold))),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} />
        </>
      ),
    },

    // slam
    {
      spell: SPELLS.SLAM,
      condition: cnd.and(cnd.not(cnd.inExecute(executeThreshold))),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.SLAM} />
        </>
      ),
    },
  ]);
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
