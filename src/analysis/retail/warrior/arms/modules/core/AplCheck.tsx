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
        cnd.or(
          cnd.debuffStacks(SPELLS.EXECUTIONERS_PRECISION_DEBUFF, { atLeast: 2 }),
          cnd.debuffPresent(SPELLS.COLOSSUS_SMASH_DEBUFF),
        ),
        cnd.inExecute(executeThreshold),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> while in execute range during{' '}
          <SpellLink spell={SPELLS.COLOSSUS_SMASH_DEBUFF} /> or with 2 stacks of{' '}
          <SpellLink spell={SPELLS.EXECUTIONERS_PRECISION_DEBUFF} />
        </>
      ),
    },

    // OP inside execute with low rage
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 800 }), executeUsable),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> while in execute range with below 80 rage
        </>
      ),
    },

    // Exe in execute
    {
      spell: executeSpell,
      condition: cnd.and(executeUsable, cnd.inExecute(executeThreshold)),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> while in execute range
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
          cnd.debuffStacks(SPELLS.EXECUTIONERS_PRECISION_DEBUFF, { atLeast: 2 }),
          cnd.not(cnd.hasTalent(TALENTS.EXECUTIONERS_PRECISION_TALENT)),
        ),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> in execute range, with 2 stacks of{' '}
          <SpellLink spell={SPELLS.EXECUTIONERS_PRECISION_DEBUFF} /> if it is talented
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

    // slam in exe
    {
      spell: SPELLS.SLAM,
      condition: cnd.inExecute(executeThreshold),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.SLAM} /> in execute range
        </>
      ),
    },

    // outside execute prio

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
