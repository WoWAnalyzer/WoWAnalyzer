import { Trans } from '@lingui/macro';
import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { useAnalyzer, useInfo } from 'interface/guide';
import { AnyEvent } from 'parser/core/Events';
import {
  Apl,
  CheckResult,
  InternalRule,
  isRuleEqual,
  spells,
  TargetType,
  Tense,
  Violation,
} from 'parser/shared/metrics/apl';
import { ConditionDescription } from 'parser/shared/metrics/apl/annotate';
import Enemies from 'parser/shared/modules/Enemies';
import useTooltip from 'interface/useTooltip';
import Combatants from 'parser/shared/modules/Combatants';

export type AplProblemData<T> = {
  claims: Set<Violation>;
  data: T;
};

export type ViolationExplainer<T> = {
  /**
   * Examine the results of the APL check and produce a list of problems, each
   * of which claims some of the detected mistakes.
   */
  claim: (apl: Apl, result: CheckResult) => Array<AplProblemData<T>>;
  /**
   * Render an explanation of the overall claims made.
   *
   * This is what shows in the "Most Common Problems" section of the guide.
   */
  render: (problem: AplProblemData<T>, apl: Apl, result: CheckResult) => JSX.Element;
  /**
   * Render a description of an individual violation. What was done wrong? What should be done differently?
   *
   * This is what shows next to the timeline in the guide.
   */
  describe: (props: { apl: Apl; violation: Violation; result: CheckResult }) => JSX.Element | null;
};

export type AplViolationExplainers = Record<string, ViolationExplainer<any>>;

export const minClaimCount = (result: CheckResult): number =>
  Math.min(10, Math.floor((result.successes.length + result.violations.length) / 20));

/**
 * Useful default for filtering out spurious / low value explanations. Requires that at least 10 violations are claimed, and at least 40% of rule-related events were violations.
 */
const defaultClaimFilter = (
  result: CheckResult,
  rule: InternalRule,
  claims: Set<Violation>,
): boolean => {
  const successes = result.successes.filter((suc) => isRuleEqual(suc.rule, rule)).length;

  return claims.size > minClaimCount(result) && claims.size / (successes + claims.size) > 0.4;
};

function TargetName({ event }: { event: AnyEvent }) {
  const combatants = useAnalyzer(Enemies);
  const friendlies = useAnalyzer(Combatants);
  const { npc: npcTooltip } = useTooltip();

  if (!combatants) {
    return null;
  }

  const enemy = combatants.getEntity(event);
  const friendly = friendlies?.getEntity(event);
  if (!enemy && friendly) {
    return <span className={friendly.spec?.className}>{friendly.name}</span>;
  } else if (enemy && !friendly) {
    return <a href={npcTooltip(enemy.guid)}>{enemy.name}</a>;
  }
  return <span className="spell-link-text">Unknown</span>;
}

function EventTimestamp({ event }: { event: AnyEvent }) {
  const info = useInfo();

  if (!info) {
    return null;
  }

  const relTime = (event.timestamp - info.fightStart) / 1000;

  const minutes = Math.floor(relTime / 60);
  const seconds = Math.round(relTime % 60);

  return (
    <strong>
      {minutes > 0 ? `${minutes}m ` : ''}
      {seconds}s
    </strong>
  );
}

export const ActualCastDescription = ({ event }: { event: Violation['actualCast'] }) => (
  <>
    At <EventTimestamp event={event} /> into the fight, you cast{' '}
    <SpellLink id={event.ability.guid} />
    {event.targetID && (
      <>
        {' '}
        on <TargetName event={event} />
      </>
    )}
    .
  </>
);

const overcastFillers: ViolationExplainer<InternalRule> = {
  claim: (apl, result) => {
    // only look for unconditional rules targeting a single spell in the bottom 3rd of the APL
    //
    // this code has filler-specific text, so we don't want to accidentally grab spells at the top of the APL
    const unconditionalRules = apl.rules.filter(
      (rule, index) =>
        rule.condition === undefined &&
        rule.spell.type === TargetType.Spell &&
        index >= (2 * apl.rules.length) / 3,
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
  describe: ({ violation }) => (
    <>
      <p>
        <ActualCastDescription event={violation.actualCast} />
      </p>
      <p>
        This is a low-priority filler spell. You should instead cast a higher-priority spell like{' '}
        <SpellLink id={violation.expectedCast[0].id} />.
      </p>
    </>
  ),
};

const droppedRule: ViolationExplainer<{ rule: InternalRule; spell: Spell }> = {
  claim: (_apl, result) => {
    const claimsByRule: Map<InternalRule, Set<Violation>> = new Map();

    result.violations.forEach((violation) => {
      const claims = claimsByRule.get(violation.rule) ?? new Set();
      claims.add(violation);

      if (!claimsByRule.has(violation.rule)) {
        claimsByRule.set(violation.rule, claims);
      }
    });

    return (
      Array.from(claimsByRule.entries())
        // this mess separates multi-spell rules into their constituent spells so that the results are more specific.
        // e.g. the "Cast Blackout Kick or Keg Smash" rule gets split into:
        //
        // - You frequently skipped casting Blackout Kick
        // - You frequently skipped casting Keg Smash
        //
        // but each gets considered independently, so if you're good at casting Keg
        // Smash but not Blackout Kick, you only see Blackout Kick
        .flatMap(([rule, claims]) => {
          if (rule.spell.type === TargetType.Spell) {
            return [{ rule, claims, spell: rule.spell.target }];
          } else {
            const bySpell: Map<number, Set<Violation>> = new Map();
            for (const claim of claims) {
              for (const spell of claim.expectedCast) {
                const targetSet = bySpell.get(spell.id) ?? new Set();
                targetSet.add(claim);
                if (!bySpell.has(spell.id)) {
                  bySpell.set(spell.id, targetSet);
                }
              }
            }

            return Array.from(bySpell.entries()).map(([spellId, claims]) => ({
              rule,
              claims,
              spell: (rule.spell.target as Spell[]).find((spell) => spell.id === spellId)!,
            }));
          }
        })
        .filter(({ rule, claims }) => defaultClaimFilter(result, rule, claims))
        .map(({ rule, spell, claims }) => ({ claims, data: { rule, spell } }))
    );
  },
  render: (claim) => (
    <Trans id="guide.apl.droppedRule">
      You frequently skipped casting <SpellLink id={claim.data.spell.id} />
      {claim.data.rule.condition && (
        <>
          {' '}
          <ConditionDescription prefix="when" rule={claim.data.rule} tense={Tense.Past} />
        </>
      )}
      .
    </Trans>
  ),
  describe: ({ violation }) => (
    <>
      <p>
        <ActualCastDescription event={violation.actualCast} />
      </p>
      <p>
        {violation.rule.condition ? (
          <>
            <ConditionDescription prefix="Since" rule={violation.rule} tense={Tense.Past} />, you{' '}
          </>
        ) : (
          'You '
        )}
        should instead have cast <SpellLink id={violation.expectedCast[0].id} />.
      </p>
    </>
  ),
};

export const defaultExplainers: AplViolationExplainers = {
  overcastFillers,
  droppedRule,
};
