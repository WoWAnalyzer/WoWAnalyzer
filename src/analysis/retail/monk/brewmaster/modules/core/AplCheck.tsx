import { useContext, useMemo, useState } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent, EventType } from 'parser/core/Events';
import aplCheck, {
  Apl,
  build,
  CheckResult,
  InternalRule,
  spells,
  TargetType,
  Tense,
  tenseAlt,
  Violation,
} from 'parser/shared/metrics/apl';
import annotateTimeline, { ConditionDescription } from 'parser/shared/metrics/apl/annotate';
import {
  targetsHit,
  buffPresent,
  buffMissing,
  hasConduit,
  optional,
  hasTalent,
} from 'parser/shared/metrics/apl/conditions';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { Section, useEvents, useInfo } from 'interface/guide';
import { RuleDescription, RuleSpellsDescription } from 'parser/shared/metrics/apl/ChecklistRule';
import styled from '@emotion/styled';
import Casts, { isApplicableEvent } from 'interface/report/Results/Timeline/Casts';
import { Trans } from '@lingui/macro';
import React from 'react';
import ProblemList, { Problem, ProblemRendererProps } from 'interface/guide/ProblemList';

export const apl = build([
  SPELLS.BONEDUST_BREW_CAST,
  {
    spell: talents.KEG_SMASH_BREWMASTER_TALENT,
    condition: buffPresent(talents.WEAPONS_OF_ORDER_BREWMASTER_TALENT),
  },
  {
    spell: talents.BREATH_OF_FIRE_BREWMASTER_TALENT,
    condition: hasTalent(talents.CHARRED_PASSIONS_BREWMASTER_TALENT),
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
  talents.RISING_SUN_KICK_TALENT,
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

const EmbeddedTimelineContainer = styled.div<{ secondWidth?: number; secondsShown?: number }>`
  .spell-timeline {
    position: relative;

    .casts {
      box-shadow: unset;
    }
  }

  padding: 1rem 2rem;
  border-radius: 0.5rem;
  background: #222;

  box-sizing: content-box;
  width: ${(props) => {
    const width = (props.secondWidth ?? 60) * (props.secondsShown ?? 10);
    return `${width}px`;
  }};
`;

/**
 * Show the cast timeline around a violation.
 */
function ViolationTimeline({
  events,
}: {
  events: AnyEvent[];
  violation: Violation;
  replaceWithExpected?: boolean;
  apl: Apl;
}): JSX.Element | null {
  const info = useInfo();

  if (!info) {
    return null;
  }

  const relevantEvents = events.filter(isApplicableEvent(info?.playerId ?? 0));

  return (
    <>
      <EmbeddedTimelineContainer secondWidth={60} secondsShown={12}>
        <div className="spell-timeline">
          <Casts
            start={relevantEvents[0].timestamp}
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

type ClaimData<T> = {
  claims: Set<Violation>;
  data: T;
};

type ViolationExplainer<T> = {
  claim: (apl: Apl, result: CheckResult) => Array<ClaimData<T>>;
  /**
   * Render an explanation of the overall claims made.
   */
  render: (claim: ClaimData<T>, apl: Apl, result: CheckResult) => JSX.Element;
  /**
   * Render a description of an individual violation. What was done wrong? What should be done differently?
   */
  describer?: (props: {
    apl: Apl;
    violation: Violation;
    result: CheckResult;
  }) => JSX.Element | null;
};

type AplViolationExplainers = Record<string, ViolationExplainer<any>>;

const minClaimCount = (result: CheckResult): number =>
  Math.min(10, Math.floor((result.successes.length + result.violations.length) / 20));

/**
 * Useful default for filtering out spurious / low value explanations. Requires that at least 10 violations are claimed, and at least 40% of rule-related events were violations.
 */
const defaultClaimFilter = (
  result: CheckResult,
  rule: InternalRule,
  claims: Set<Violation>,
): boolean => {
  const successes = result.successes.filter((suc) => suc.rule === rule).length;

  return claims.size > minClaimCount(result) && claims.size / (successes + claims.size) > 0.4;
};

const overcastFillers: ViolationExplainer<InternalRule> = {
  claim: (apl, result) => {
    // only look for unconditional rules targeting a single spell.
    const unconditionalRules = apl.rules.filter(
      (rule) => rule.condition === undefined && rule.spell.type === TargetType.Spell,
    );
    const claimsByRule: Map<InternalRule, Set<Violation>> = new Map();

    result.violations.forEach((violation) => {
      const actualSpellId = violation.actualCast.ability.guid;
      const fillerRule = unconditionalRules.find((rule) =>
        spells(rule).some((spell) => spell.id === actualSpellId),
      );
      if (fillerRule) {
        const claims = claimsByRule.get(fillerRule) ?? new Set();
        claims.add(violation);
        if (!claimsByRule.has(fillerRule)) {
          claimsByRule.set(fillerRule, claims);
        }
      }
    });

    return Array.from(claimsByRule.entries())
      .filter(([rule, claims]) => defaultClaimFilter(result, rule, claims))
      .map(([rule, claims]) => ({ claims, data: rule }));
  },
  render: (claim) => (
    <Trans id="guide.apl.overcastFillers">
      You frequently cast <SpellLink id={spells(claim.data)[0].id} /> when more important spells
      were available.
    </Trans>
  ),
};

const droppedRule: ViolationExplainer<InternalRule> = {
  claim: (_apl, result) => {
    const claimsByRule: Map<InternalRule, Set<Violation>> = new Map();

    result.violations.forEach((violation) => {
      const claims = claimsByRule.get(violation.rule) ?? new Set();
      claims.add(violation);

      if (!claimsByRule.has(violation.rule)) {
        claimsByRule.set(violation.rule, claims);
      }
    });

    return Array.from(claimsByRule.entries())
      .filter(([rule, claims]) => defaultClaimFilter(result, rule, claims))
      .map(([rule, claims]) => ({ claims, data: rule }));
  },
  render: (claim) => (
    <Trans id="guide.apl.droppedRule">
      You frequently skipped casting <RuleSpellsDescription rule={claim.data} />{' '}
      <ConditionDescription prefix="when" rule={claim.data} tense={Tense.Past} />
    </Trans>
  ),
  describer: ({ violation }) => (
    <Trans id="guide.apl.droppedRule.describer">
      <SpellLink id={violation.expectedCast[0].id} /> is higher priority than{' '}
      <SpellLink id={violation.actualCast.ability.guid} />
    </Trans>
  ),
};

const defaultExplainers: AplViolationExplainers = {
  overcastFillers,
  droppedRule,
};

const EmbedContainer = styled.div`
  background: #222;
  border-radius: 0.5em;
  padding: 1em 1.5em;
  display: grid;
  grid-gap: 2rem;
  grid-template-columns: 1fr max-content;
  align-content: center;
  align-items: center;
`;

const ShowMeButton = styled.button`
  appearance: none;
  background: #333;
  border-radius: 0.5rem;
  padding: 1rem;
  border: none;
  box-shadow: 1px 1px 3px #111;

  &:hover {
    filter: brightness(120%);
  }
`;

type SelectedExplanation<T> = {
  describer: ViolationExplainer<T>['describer'];
  claimData: ClaimData<T>;
};

const ExplanationSelectionContext = React.createContext<
  (selection: SelectedExplanation<any>) => void
>(() => undefined);

function AplViolationExplanation<T = any>({
  claimData,
  describer,
  children,
}: {
  claimData: ClaimData<T>;
  describer?: ViolationExplainer<T>['describer'];
  children: React.ReactChild;
}): JSX.Element {
  const setSelection = useContext(ExplanationSelectionContext);

  return (
    <EmbedContainer>
      <div>{children}</div>
      <ShowMeButton onClick={() => setSelection?.({ describer, claimData })}>Show Me!</ShowMeButton>
    </EmbedContainer>
  );
}

const ExplanationList = styled.ul`
  list-style: none;
  padding-left: 0;

  li {
    margin-top: 1rem;

    &:first-of-type {
      margin-top: initial;
    }
  }
`;

function AplViolationExplanations({
  apl,
  result,
  explainers,
}: {
  apl: Apl;
  result: CheckResult;
  explainers: AplViolationExplainers;
}): JSX.Element {
  const claims = Object.entries(explainers)
    .flatMap(([key, { claim }]) =>
      claim(apl, result).map((res): [string, ClaimData<any>] => [key, res]),
    )
    .sort(([, resA], [, resB]) => resA.claims.size - resB.claims.size);

  const unclaimedViolations = new Set(result.violations);

  let remainingClaimData = claims.map(([key, claimData]): [
    string,
    ClaimData<any>,
    Set<Violation>,
  ] => [key, claimData, new Set(claimData.claims)]);

  const appliedClaims = [];

  // very inefficient approach, performance hinges on claim list being short
  while (remainingClaimData.length > 0) {
    const [key, claimData, remainingClaims] = remainingClaimData.pop()!;
    for (const violation of remainingClaims) {
      unclaimedViolations.delete(violation);
    }
    const explanation = explainers[key].render(claimData, apl, result);
    appliedClaims.push(
      <AplViolationExplanation claimData={claimData} describer={explainers[key].describer}>
        {explanation}
      </AplViolationExplanation>,
    );

    remainingClaimData = remainingClaimData
      .map((datum) => {
        for (const violation of remainingClaims) {
          datum[2].delete(violation);
        }
        return datum;
      })
      .filter(([, , otherClaims]) => otherClaims.size > minClaimCount(result))
      .sort(([, , setA], [, , setB]) => setA.size - setB.size);
  }

  return (
    <ExplanationList>
      {appliedClaims.map((result, ix) => (
        <li key={ix}>{result}</li>
      ))}
    </ExplanationList>
  );
}

/**
 * Produce a summary of the APL itself. This is just an un-annotated reference.
 */
function AplSummary({ apl, results }: { apl: Apl; results: CheckResult }): JSX.Element | null {
  const castSpells = new Set(
    results.successes
      .map((suc) => suc.actualCast.ability.guid)
      .concat(results.violations.map((v) => v.actualCast.ability.guid)),
  );
  return (
    <AplRuleList>
      {apl.rules
        .filter(
          (rule) =>
            (rule.condition === undefined &&
              spells(rule).some((spell) => castSpells.has(spell.id))) ||
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

const AplViolationTimelineContainer = styled.div``;

const ViolationProblemContainer = styled.div`
  display: grid;
  grid-template-columns: auto max-content;
  grid-gap: 1rem;
`;

function ViolationProblemList<T = any>({
  describer: DescribeViolation,
  claimData,
  apl,
  result,
}: SelectedExplanation<T> & { result: CheckResult; apl: Apl }): JSX.Element | null {
  const events = useEvents();
  const info = useInfo();

  const renderer = useMemo(
    () => (props: ProblemRendererProps<Violation>) => (
      <ViolationProblemContainer>
        {DescribeViolation && (
          <div>
            <DescribeViolation violation={props.problem.data} result={result} apl={apl} />
          </div>
        )}
        <div>
          <p>Here's what you did:</p>
          <ViolationTimeline violation={props.problem.data} events={props.events} apl={apl} />
        </div>
      </ViolationProblemContainer>
    ),
    [DescribeViolation, result, apl],
  );

  if (!info) {
    return null;
  }

  const problems = Array.from(claimData.claims).map(
    (violation): Problem<Violation> => ({
      range: {
        start: violation.actualCast.timestamp,
        end: violation.actualCast.timestamp,
      },
      context: {
        before: 5000,
        after: 7000,
      },
      data: violation,
    }),
  );

  return (
    <AplViolationTimelineContainer>
      <ProblemList
        events={events}
        info={info}
        renderer={renderer}
        problems={problems}
        label="Example"
      />
    </AplViolationTimelineContainer>
  );
}

const AplViolationContainer = styled.div``;

const AplLayout = styled.div`
  display: grid;
  grid-template-areas: 'summary problems' 'timeline timeline';
  grid-gap: 2rem;

  ${AplRuleList} {
    grid-area: summary;
  }

  ${AplViolationContainer} {
    grid-area: problems;
  }

  ${AplViolationTimelineContainer} {
    grid-area: timeline;
  }
`;

export function AplSection(): JSX.Element | null {
  const events = useEvents();
  const info = useInfo();

  const [selectedExplanation, setSelectedExplanation] = useState<
    SelectedExplanation<any> | undefined
  >(undefined);

  const result: CheckResult | undefined = useMemo(() => (info ? check(events, info) : undefined), [
    events,
    info,
  ]);

  if (!info || !result) {
    return null;
  }

  return (
    <ExplanationSelectionContext.Provider value={setSelectedExplanation}>
      <Section title="Rotation">
        Brewmaster Monk uses a <em>priority list</em> for determining which of your offensive
        abilities to cast. <section>TODO BETTER TEXT</section>
        <AplLayout>
          <AplSummary apl={apl} results={result} />
          <AplViolationContainer>
            <AplViolationExplanations apl={apl} result={result} explainers={defaultExplainers} />
          </AplViolationContainer>
          {selectedExplanation && (
            <ViolationProblemList {...selectedExplanation} result={result} apl={apl} />
          )}
        </AplLayout>
      </Section>
    </ExplanationSelectionContext.Provider>
  );
}
