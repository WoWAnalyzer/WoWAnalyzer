import Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import GenericCastEfficiencyRequirement from 'parser/shared/modules/features/Checklist/GenericCastEfficiencyRequirement';
import Requirement, {
  RequirementThresholds,
} from 'parser/shared/modules/features/Checklist/Requirement';
import Rule from 'parser/shared/modules/features/Checklist/Rule';
import * as React from 'react';

import { ConditionDescription } from './annotate';
import {
  InternalRule as AplRule,
  Apl,
  CheckResult,
  spells,
  Tense,
  Violation,
  isRuleEqual,
} from './index';

interface Props {
  apl: Apl;
  name?: React.ReactNode;
  description?: React.ReactNode;
  checkResults: CheckResult;
  castEfficiency: CastEfficiency;
  cooldowns?: Spell[];
  otherRequirements?: React.ReactNode[];
}

export type AplRuleProps = Pick<Props, 'apl' | 'checkResults'>;

// count the number of violations of a rule with runs removed
const numFailures = (violations: Violation[], rule: AplRule) =>
  violations.filter((v) => isRuleEqual(v.rule, rule)).length;

const threshold = (
  rule: AplRule,
  { successes, violations }: CheckResult,
): RequirementThresholds | null => {
  const numSuccess = successes.filter((x) => isRuleEqual(x.rule, rule)).length;
  const numFailure = numFailures(violations, rule);

  const numCasts = numSuccess + numFailure;

  if (numCasts === 0) {
    return null;
  }

  return {
    style: ThresholdStyle.PERCENTAGE,
    actual: numSuccess / numCasts,
    isLessThan: {
      minor: 0.9,
      average: 0.8,
      major: 0.7,
    },
  };
};

const Tooltip = ({
  rule,
  checkResults: { successes, violations },
}: {
  rule: AplRule;
  checkResults: CheckResult;
}) => {
  const numSuccess = successes.filter((x) => isRuleEqual(x.rule, rule)).length;
  const numFailure = numFailures(violations, rule);
  const mistakes = Object.entries(
    violations
      .filter((v) => isRuleEqual(v.rule, rule))
      .reduce((counts: { [spellId: number]: number }, v) => {
        counts[v.actualCast.ability.guid] = (counts[v.actualCast.ability.guid] || 0) + 1;
        return counts;
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const mistakeText =
    numFailure > 0 ? (
      <div>
        The most common mistakes you made were:
        <ul>
          {mistakes.map(([spellId, count]) => (
            <li key={spellId}>
              <SpellLink id={parseInt(spellId)} /> ({count} times)
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  const extraText = rule.condition?.tooltip && (
    <div style={{ marginTop: '1em' }}>{rule.condition.tooltip()}</div>
  );

  return (
    <>
      This rule applied {numSuccess + numFailure} times, and you cast the matching spell{' '}
      {numSuccess} times. {mistakeText}
      {extraText}
    </>
  );
};

const Description = () => (
  <div>
    Damage rotations are usually written as <em>priority lists:</em> go from top to bottom and cast
    the first ability that is available. This checklist compares how you did against the standard
    priority list for your specialization.
  </div>
);

function CooldownList({ castEfficiency, cooldowns }: Pick<Props, 'castEfficiency' | 'cooldowns'>) {
  if (!cooldowns || cooldowns.length === 0) {
    return null;
  }

  return (
    <>
      <p className="col-md-12 text-muted">
        In addition to your rotational abilities, ensure that you're using your major cooldowns:
      </p>

      {cooldowns
        .filter((spell) => castEfficiency.getCastEfficiencyForSpellId(spell.id))
        .map((spell) => (
          <GenericCastEfficiencyRequirement
            key={spell.id}
            spell={spell.id}
            castEfficiency={castEfficiency.getCastEfficiencyForSpellId(spell.id)}
          />
        ))}
    </>
  );
}

export function RuleSpellsDescription({ rule }: { rule: AplRule }): JSX.Element {
  return (
    <>
      {spells(rule).map((spell, index) => (
        <React.Fragment key={index}>
          {index > 0 ? ' or ' : ''}
          <SpellLink id={spell.id} />
        </React.Fragment>
      ))}
    </>
  );
}

export function RuleDescription({ rule }: { rule: AplRule }): JSX.Element {
  return (
    <>
      Cast <RuleSpellsDescription rule={rule} />
      {rule.condition ? ' ' : ''}
      <ConditionDescription prefix="when" rule={rule} tense={Tense.Present} />
    </>
  );
}

export default function ChecklistRule(props: Props) {
  return (
    <Rule
      name={props.name || <>Use your damaging abilities effectively</>}
      description={
        <>
          {props.description} <Description />
        </>
      }
    >
      <>
        {props.apl.rules
          .map<[AplRule, RequirementThresholds | null]>((rule) => [
            rule,
            threshold(rule, props.checkResults),
          ])
          .filter(([_, t]) => t)
          .map(([rule, thresh], ix) => {
            if (thresh) {
              return (
                <Requirement
                  fullWidth
                  key={ix}
                  name={
                    <>
                      <strong>{ix + 1}.</strong> <RuleDescription rule={rule} />
                    </>
                  }
                  thresholds={thresh}
                  tooltip={<Tooltip rule={rule} checkResults={props.checkResults} />}
                />
              );
            } else {
              return null;
            }
          })}

        <CooldownList {...props} />

        {props.otherRequirements}
      </>
    </Rule>
  );
}
