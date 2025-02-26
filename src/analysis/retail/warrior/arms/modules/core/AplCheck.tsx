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

// tmy https://www.warcraftlogs.com/reports/Lna7ANqKFbBWkD2Q?fight=20&type=casts&source=376
// bris https://www.warcraftlogs.com/reports/1R9TkvMF7HLPpVdm?fight=19&type=damage-done&source=43
// nezy (opp) https://www.warcraftlogs.com/reports/y9gBTjamNH84vGMZ?fight=26&type=damage-done&source=2
// walhe (col) https://www.warcraftlogs.com/reports/Ft8NByGLZ64AMX2f?fight=14&type=summary&source=12
// pravum (col, wb, no massacre) https://www.warcraftlogs.com/reports/WTgD24mMz6wYaBL1?fight=5&type=summary&source=138

export const apl = (info: PlayerInfo): Apl => {
  const executeThreshold = info.combatant.hasTalent(TALENTS.MASSACRE_SPEC_TALENT)
    ? MASSACRE_EXECUTE_THRESHOLD
    : DEFAULT_EXECUTE_THRESHOLD;
  const executeUsable = cnd.or(
    cnd.buffPresent(SPELLS.SUDDEN_DEATH_ARMS_TALENT_BUFF),
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
  executeUsable: Condition<any>,
  executeSpell: Spell,
): Apl => {
  return build([
    // Exe with 3x MFE, 2x SD, refresh Jugg
    {
      spell: executeSpell,
      condition: cnd.and(
        executeUsable,
        cnd.or(
          cnd.buffRemaining(SPELLS.SUDDEN_DEATH_ARMS_TALENT_BUFF, SUDDEN_DEATH_DURATION, {
            atMost: 3000,
          }), // TODO sudden death does wacky things with its duration and apply/refresh events,
          // would prodbably be best to handle with a normalizer in a later update
          cnd.buffRemaining(SPELLS.JUGGERNAUT, JUGGERNAUT_DURATION, { atMost: 3000 }),
          cnd.buffStacks(SPELLS.SUDDEN_DEATH_ARMS_TALENT_BUFF, { atLeast: 2, atMost: 2 }),
          cnd.debuffStacks(SPELLS.MARKED_FOR_EXECUTION, { atLeast: 3, atMost: 3 }),
        ),
      ),
      description: (
        <>
          Cast <SpellLink spell={executeSpell} /> when any of the following conditions are met:
          <ul>
            <li>
              Your target has 3 stacks of <SpellLink spell={SPELLS.MARKED_FOR_EXECUTION} />
            </li>
            <li>
              Your <SpellLink spell={SPELLS.JUGGERNAUT} /> is about to expire
            </li>
            <li>
              Your <SpellLink spell={SPELLS.SUDDEN_DEATH_ARMS_TALENT_BUFF} /> is about to expire
            </li>
            <li>
              You have 2 stacks of <SpellLink spell={SPELLS.SUDDEN_DEATH_ARMS_TALENT_BUFF} />
            </li>
          </ul>
        </>
      ),
    },

    // OP inside execute with Opp
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(
        cnd.buffPresent(SPELLS.OPPORTUNIST),
        cnd.buffStacks(TALENTS.OVERPOWER_TALENT, { atMost: 1 }), // Martial Prowess buff
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 850 }),
        cnd.inExecute(executeThreshold),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> while in execute range with the following
          conditions:
          <ul>
            <li>
              You have the <SpellLink spell={SPELLS.OPPORTUNIST} /> buff
            </li>
            <li>You are below 85 rage</li>
            <li>
              You have fewer than 2 stacks of{' '}
              <SpellLink spell={TALENTS.OVERPOWER_TALENT}> Martial Prowess</SpellLink>{' '}
            </li>
          </ul>
        </>
      ),
    },

    // SkS inside execute
    {
      spell: TALENTS.SKULLSPLITTER_TALENT,
      condition: cnd.optionalRule(
        cnd.and(
          cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 400 }), // rage is logged 10x higher than the player's "real" value
          cnd.inExecute(executeThreshold),
        ),
      ),
      description: (
        <>
          (Optional) Cast <SpellLink spell={TALENTS.SKULLSPLITTER_TALENT} /> while below 40 rage and
          in execute range. You can gamble on getting enough rage from other sources, but on average
          it's best to avoid that.
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

    // OP with FF outside execute
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(
        cnd.hasTalent(TALENTS.FIERCE_FOLLOWTHROUGH_TALENT),
        cnd.spellCharges(SPELLS.OVERPOWER, { atLeast: 2 }),
        cnd.buffPresent(SPELLS.WINNING_STREAK_BUFF_ARMS),
        cnd.not(cnd.inExecute(executeThreshold)),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> when you have 2 charges available and have the{' '}
          <SpellLink spell={SPELLS.WINNING_STREAK_BUFF_ARMS} /> buff
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

    // SkS outside execute
    {
      spell: TALENTS.SKULLSPLITTER_TALENT,
      condition: cnd.not(cnd.inExecute(executeThreshold)),
      description: (
        <>
          Cast <SpellLink spell={TALENTS.SKULLSPLITTER_TALENT} /> while outside execute range
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
  executeUsable: Condition<any>,
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

    // SkS in exe below 85
    {
      spell: TALENTS.SKULLSPLITTER_TALENT,
      condition: cnd.optionalRule(
        cnd.and(
          cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 850 }), // rage is logged 10x higher than the player's "real" value
          cnd.inExecute(executeThreshold),
        ),
      ),
      description: (
        <>
          (Optional) Cast <SpellLink spell={TALENTS.SKULLSPLITTER_TALENT} /> while below 85 rage and
          in execute range. You can gamble on getting enough rage from other sources, but on average
          it's best to avoid that.
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

    // OP in exe
    {
      spell: SPELLS.OVERPOWER,
      condition: cnd.and(
        cnd.hasResource(RESOURCE_TYPES.RAGE, { atMost: 500 }),
        cnd.inExecute(executeThreshold),
      ),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.OVERPOWER} /> in execute range when you are below 50 rage
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

    // SkS (in exe)
    {
      spell: TALENTS.SKULLSPLITTER_TALENT,
      condition: cnd.inExecute(executeThreshold),
      description: (
        <>
          Cast <SpellLink spell={TALENTS.SKULLSPLITTER_TALENT} /> in execute range
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

    // MS in exe
    {
      spell: SPELLS.MORTAL_STRIKE,
      condition: cnd.inExecute(executeThreshold),
      description: (
        <>
          Cast <SpellLink spell={SPELLS.MORTAL_STRIKE} /> in execute range
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

    // SkS no exe
    {
      spell: TALENTS.SKULLSPLITTER_TALENT,
      condition: cnd.not(cnd.inExecute(executeThreshold)),
      description: (
        <>
          Cast <SpellLink spell={TALENTS.SKULLSPLITTER_TALENT} />
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
