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
        cnd.debuffStacks(SPELLS.EXECUTIONERS_PRECISION_DEBUFF, { atLeast: 2 }),
        cnd.inExecute(executeThreshold),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> while in execute range with 2 stacks of{' '}
          <SpellLink spell={SPELLS.EXECUTIONERS_PRECISION_DEBUFF} />
        </>
      ),
    },

    // OP inside execute with low rage
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 900 }), executeUsable),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> while in execute range with below 90 rage
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

    // outside of execute prio

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

    // OP in exe
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(
        cnd.inExecute(executeThreshold),
        cnd.or(
          cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 400 }),
          cnd.spellCharges(SPELLS.OVERPOWER, { atLeast: 2 }),
        ),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> in execute range when you have two charges, or
          are below 40 rage
        </>
      ),
    },

    // MS in exe
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.and(cnd.inExecute(executeThreshold)),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> in execute range
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
      condition: cnd.and(executeUsable, cnd.inExecute(executeThreshold)),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> in execute range
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

    // Exe with SD
    {
      spell: executeSpell,
      condition: cnd.buffPresent(SPELLS.SUDDEN_DEATH_TALENT_BUFF),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> with{' '}
          <SpellLink spell={SPELLS.SUDDEN_DEATH_TALENT_BUFF} />
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
