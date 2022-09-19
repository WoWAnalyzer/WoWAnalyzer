import { useMemo } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { suggestion } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import aplCheck, { Apl, build, CheckResult, tenseAlt, Violation } from 'parser/shared/metrics/apl';
import annotateTimeline, { InefficientCastAnnotation } from 'parser/shared/metrics/apl/annotate';
import {
  targetsHit,
  buffPresent,
  buffMissing,
  hasLegendary,
  hasConduit,
  optional,
  hasTalent,
} from 'parser/shared/metrics/apl/conditions';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { Section, useEvents, useInfo } from 'interface/guide';
import { RuleDescription } from 'parser/shared/metrics/apl/ChecklistRule';
import styled from '@emotion/styled';
import Casts, { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';

export const apl = build([
  SPELLS.BONEDUST_BREW_CAST,
  {
    spell: talents.KEG_SMASH_BREWMASTER_TALENT,
    condition: buffPresent(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL),
  },
  {
    spell: talents.BREATH_OF_FIRE_BREWMASTER_TALENT,
    condition: hasLegendary(SPELLS.CHARRED_PASSIONS),
  },
  {
    spell: talents.KEG_SMASH_BREWMASTER_TALENT,
    condition: cnd.describe(
      cnd.and(
        hasTalent(talents.STORMSTOUTS_LAST_KEG_BREWMASTER_TALENT),
        cnd.spellFractionalCharges(talents.KEG_SMASH_BREWMASTER_TALENT, { atLeast: 1.5 }),
      ),
      (tense) => (
        <>
          you {tenseAlt(tense, 'have', 'had')} 2 charges or the 2nd charge{' '}
          {tenseAlt(tense, 'is', 'was')} about to come off cooldown.
        </>
      ),
    ),
  },
  {
    spell: talents.KEG_SMASH_BREWMASTER_TALENT,
    condition: cnd.describe(cnd.not(cnd.hasLegendary(SPELLS.STORMSTOUTS_LAST_KEG)), () => ''),
  },
  [SPELLS.BLACKOUT_KICK_BRM, talents.KEG_SMASH_BREWMASTER_TALENT],
  talents.BREATH_OF_FIRE_BREWMASTER_TALENT,
  {
    spell: talents.RUSHING_JADE_WIND_BREWMASTER_TALENT,
    condition: buffMissing(talents.RUSHING_JADE_WIND_BREWMASTER_TALENT, {
      timeRemaining: 2000,
      duration: 6000,
    }),
  },
  { spell: SPELLS.SPINNING_CRANE_KICK_BRM, condition: buffPresent(SPELLS.CHARRED_PASSIONS_BUFF) },
  talents.CHI_WAVE_TALENT,
  talents.CHI_BURST_TALENT,
  {
    spell: SPELLS.SPINNING_CRANE_KICK_BRM,
    condition: targetsHit(
      { atLeast: 2 },
      {
        lookahead: 500,
        targetType: EventType.Damage,
        targetSpell: SPELLS.SPINNING_CRANE_KICK_DAMAGE,
      },
    ),
  },
  {
    spell: SPELLS.SPINNING_CRANE_KICK_BRM,
    condition: optional(
      hasConduit(SPELLS.WALK_WITH_THE_OX),
      <>
        It is worthwhile to cast <SpellLink id={SPELLS.SPINNING_CRANE_KICK_BRM.id} /> over{' '}
        <SpellLink id={SPELLS.TIGER_PALM.id} /> when using this conduit <em>if</em> doing so would
        get you an extra cast of{' '}
        <SpellLink id={talents.INVOKE_NIUZAO_THE_BLACK_OX_BREWMASTER_TALENT.id} /> that lines up
        with incoming damage. We cannot check this automatically, and be warned that it is a small
        defensive loss due to the loss of Brew cooldown reduction.
      </>,
    ),
  },
  SPELLS.TIGER_PALM,
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

const EmbeddedTimelineContainer = styled.div<{ width?: number }>`
  .spell-timeline {
    position: relative;
  }

  padding: 1rem 2rem;
  border-radius: 0.5rem;
  background: #222;
  width: ${(props) => (props.width ? `${props.width}px` : '325px')};
`;

function ViolationTimeline({
  violation,
  replaceWithExpected,
  result: { violations: allViolations },
}: {
  violation: Violation;
  replaceWithExpected?: boolean;
  result: CheckResult;
}): JSX.Element {
  const events = useEvents();
  const info = useInfo();

  const windowStart = violation.actualCast.timestamp - 5000;
  const windowEnd = violation.actualCast.timestamp + 5000;

  let relevantEvents = events
    .filter(({ timestamp }) => timestamp >= windowStart && timestamp <= windowEnd)
    .filter(isApplicableEvent(info?.playerId ?? 0));

  if (replaceWithExpected) {
    const spell = violation.expectedCast[0];
    const ability = {
      guid: spell.id,
      name: spell.name,
      abilityIcon: spell.icon,
      type: -1,
    };

    const newEventProps = {
      ability,
      meta: {
        isEnhancedCast: true,
        enhancedCastReason: <RuleDescription rule={violation.rule} />,
      },
    };
    relevantEvents = relevantEvents.map((event) => {
      if (event === violation.actualCast) {
        return { ...event, ...newEventProps };
      }

      if ('meta' in event) {
        const otherViolation = allViolations.find((violation) => violation.actualCast === event);
        if (otherViolation && otherViolation.expectedCast.includes(spell)) {
          if (otherViolation.expectedCast.length === 1) {
            // no other spells that we could cast, just remove the annotation
            // it is possible that there could be another rule that we should
            // apply, but we don't know of it at this point.
            return { ...event, meta: undefined };
          } else {
            return {
              ...event,
              meta: {
                ...event.meta,
                inefficientCastReason: (
                  <InefficientCastAnnotation
                    violation={{
                      ...otherViolation,
                      expectedCast: otherViolation.expectedCast.filter(
                        (otherSpell) => otherSpell !== spell,
                      ),
                    }}
                  />
                ),
              },
            };
          }
        }
      }

      return event;
    });
  }

  return (
    <>
      <EmbeddedTimelineContainer>
        <div className="spell-timeline">
          <Casts
            start={Math.max(windowStart, relevantEvents[0].timestamp)}
            movement={undefined}
            secondWidth={60}
            events={relevantEvents}
          />
        </div>
      </EmbeddedTimelineContainer>
    </>
  );
}

const AplRuleList = styled.ol`
  padding-left: 0;
`;

/**
 * Produce a summary of the APL itself. This is just an un-annotated reference.
 */
function AplSummary({ apl, results }: { apl: Apl; results: CheckResult }): JSX.Element | null {
  return (
    <AplRuleList>
      {apl.rules
        .filter(
          (rule) =>
            results.successes.some((suc) => suc.rule === rule) ||
            results.violations.some((v) => v.rule === rule),
        )
        .map((rule, index) => (
          <li key={index}>
            <RuleDescription rule={rule} />
          </li>
        ))}
    </AplRuleList>
  );
}

export function AplSection(): JSX.Element | null {
  const events = useEvents();
  const info = useInfo();

  const result: CheckResult | undefined = useMemo(() => (info ? check(events, info) : undefined), [
    events,
    info,
  ]);

  if (!info || !result) {
    return null;
  }

  return (
    <Section title="Rotation">
      Brewmaster Monk uses a <em>priority list</em> for determining which of your offensive
      abilities to cast. <section>TODO BETTER TEXT</section>
      <AplSummary apl={apl} results={result} />
      {result.violations.length > 0 && (
        <>
          <ViolationTimeline result={result} violation={result.violations[0]} />
          <ViolationTimeline replaceWithExpected result={result} violation={result.violations[0]} />
        </>
      )}
    </Section>
  );
}
