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

const JUGGERNAUT_DURATION = 12000;
const SUDDEN_DEATH_DURATION = 12000;
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
    // Exe with 3x MFE, 2x SD, refresh Jugg
    {
      spell: executeSpell,
      condition: cnd.and(
        executeUsable,
        cnd.or(
          cnd.buffRemaining(SPELLS.SUDDEN_DEATH_TALENT_BUFF, SUDDEN_DEATH_DURATION, {
            atMost: 3000,
          }),
          cnd.buffRemaining(SPELLS.JUGGERNAUT, JUGGERNAUT_DURATION, { atMost: 3000 }),
          cnd.buffStacks(SPELLS.SUDDEN_DEATH_TALENT_BUFF, { atLeast: 2, atMost: 2 }),
          cnd.buffStacks(SPELLS.EXECUTIONER_TALENT_BUFF, { atLeast: 3, atMost: 3 }),
        ),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> when any of the following conditions are met:
          <ul>
            <li>
              Your target has 3 stacks of <SpellLink spell={SPELLS.EXECUTIONER_TALENT_BUFF} />
            </li>
            <li>
              Your <SpellLink spell={SPELLS.JUGGERNAUT} /> is about to expire
            </li>
            <li>
              Your <SpellLink spell={SPELLS.SUDDEN_DEATH_TALENT_BUFF} /> is about to expire
            </li>
            <li>
              You have 2 stacks of <SpellLink spell={SPELLS.SUDDEN_DEATH_TALENT_BUFF} />
            </li>
          </ul>
        </>
      ),
    },

    // OP inside execute with Opp (no rav)
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(
        cnd.buffPresent(SPELLS.OPPORTUNIST),
        cnd.buffStacks(TALENTS.OVERPOWER_TALENT, { atMost: 1 }), // Martial Prowess buff
        cnd.inExecute(executeThreshold),
        cnd.not(cnd.hasTalent(TALENTS.RAVAGER_TALENT)),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> while in execute range with the following
          conditions:
          <ul>
            <li>
              You have the <SpellLink spell={SPELLS.OPPORTUNIST} /> buff
            </li>
            <li>
              You have fewer than 2 stacks of{' '}
              <SpellLink spell={TALENTS.OVERPOWER_TALENT}> Martial Prowess</SpellLink>{' '}
            </li>
            <li>
              You are below 85 rage, if playing the <SpellLink spell={TALENTS.RAVAGER_TALENT} />{' '}
              variant of Slayer
            </li>
          </ul>
        </>
      ),
    },

    // OP inside execute with Opp (no rav)
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(
        cnd.buffPresent(SPELLS.OPPORTUNIST),
        cnd.buffStacks(TALENTS.OVERPOWER_TALENT, { atMost: 1 }), // Martial Prowess buff
        cnd.inExecute(executeThreshold),
        cnd.and(
          cnd.hasTalent(TALENTS.RAVAGER_TALENT),
          cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 850 }),
        ),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> while in execute range with the following
          conditions:
          <ul>
            <li>
              You have the <SpellLink spell={SPELLS.OPPORTUNIST} /> buff
            </li>

            <li>
              You have fewer than 2 stacks of{' '}
              <SpellLink spell={TALENTS.OVERPOWER_TALENT}> Martial Prowess</SpellLink>{' '}
            </li>
            <li>
              You are below 85 rage, if playing the <SpellLink spell={TALENTS.RAVAGER_TALENT} />{' '}
              variant of Slayer
            </li>
          </ul>
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

    // OP inside execute with FF
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(
        cnd.hasTalent(TALENTS.FIERCE_FOLLOWTHROUGH_TALENT),
        cnd.buffStacks(TALENTS.OVERPOWER_TALENT, { atMost: 1 }), // Martial Prowess buff
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 400 }),
        cnd.inExecute(executeThreshold),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> while in execute range with the following
          conditions:
          <ul>
            <li>You are below 40 rage</li>
            <li>
              You have fewer than 2 stacks of{' '}
              <SpellLink spell={TALENTS.OVERPOWER_TALENT}> Martial Prowess</SpellLink>{' '}
            </li>
          </ul>
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

    // OP with Opp outside execute
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(
        cnd.buffPresent(SPELLS.OPPORTUNIST),
        cnd.not(cnd.inExecute(executeThreshold)),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> when you have the{' '}
          <SpellLink spell={SPELLS.OPPORTUNIST} /> buff
        </>
      ),
    },

    // MS outside execute
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.not(cnd.inExecute(executeThreshold)),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> while outside execute range
        </>
      ),
    },

    // OP
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(cnd.not(cnd.inExecute(executeThreshold))),
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
    // Exe to refresh Jugg
    {
      spell: executeSpell,
      condition: cnd.and(
        executeUsable,
        cnd.buffRemaining(SPELLS.JUGGERNAUT, JUGGERNAUT_DURATION, { atMost: 3000 }),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> when your <SpellLink spell={SPELLS.JUGGERNAUT} />{' '}
          is about to expire
        </>
      ),
    },

    // MS in exe with 2xEP
    // Technically should also check that ravager isn't out
    // but there's no logged buff for it
    // so probably want to add a normalizer later
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

    // MS in exe with BL, 1+ EP
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.and(
        cnd.debuffStacks(SPELLS.EXECUTIONERS_PRECISION_DEBUFF, { atLeast: 1 }),
        cnd.inExecute(executeThreshold),
        cnd.hasTalent(TALENTS.BATTLELORD_TALENT),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> while in execute range with at least 1
          stack of <SpellLink spell={SPELLS.EXECUTIONERS_PRECISION_DEBUFF} /> if you have the{' '}
          <SpellLink spell={TALENTS.BATTLELORD_TALENT} /> talent
        </>
      ),
    },

    // MS in exe without EP
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.and(
        cnd.inExecute(executeThreshold),
        cnd.not(cnd.hasTalent(TALENTS.EXECUTIONERS_PRECISION_TALENT)),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> in execute range
        </>
      ),
    },

    // OP in exe
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 900 }),
        cnd.inExecute(executeThreshold),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> in execute range when you are below 90 rage
        </>
      ),
    },

    // exe in exe with 40 rage and EP
    {
      spell: executeSpell,
      condition: cnd.and(
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atLeast: 400 }),
        cnd.hasTalent(TALENTS.EXECUTIONERS_PRECISION_TALENT),
        cnd.inExecute(executeThreshold),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> while above 40 rage in execute range
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

    // exe no exe
    {
      spell: executeSpell,
      condition: cnd.and(executeUsable, cnd.not(cnd.inExecute(executeThreshold))),
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
