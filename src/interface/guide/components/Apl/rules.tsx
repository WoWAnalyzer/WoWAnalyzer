import styled from '@emotion/styled';
import { InformationIcon } from 'interface/icons';
import TooltipWrapper from 'interface/Tooltip';
import SpellLink from 'interface/SpellLink';
import {
  spells,
  Apl,
  CheckResult,
  InternalRule as AplRule,
  isRuleEqual,
  Tense,
} from 'parser/shared/metrics/apl';
import { ConditionDescription } from 'parser/shared/metrics/apl/annotate';
import { useMemo } from 'react';
import * as React from 'react';

export const AplRuleList = styled.ol`
  padding-left: 1.5rem;
`;

const AplListItem = styled.li<{ highlighted?: boolean; muted?: boolean }>`
  opacity: ${(props) => (props.muted ? 0.5 : 1)};

  ${(props) =>
    props.highlighted &&
    `
    list-style-type: none;
    padding-left: 0;
    margin-left: -1.5rem;

    &::before {
      content: '\\e080';
      font-family: 'Glyphicons Halflings';
      color: #fab700;
      margin-right: 0.5rem;
      font-size: 10px;
    }

    &::after {
      content: '\\e079';
      font-family: 'Glyphicons Halflings';
      color: #fab700;
      margin-left: 0.5rem;
      font-size: 10px;
    }
  `}
`;

export default function AplRules({
  apl,
  results,
  highlightRule,
}: {
  apl: Apl;
  results: CheckResult;
  highlightRule?: AplRule;
}): JSX.Element {
  const castSpells = new Set(
    results.successes
      .map((suc) => suc.actualCast.ability.guid)
      .concat(results.violations.map((v) => v.actualCast.ability.guid)),
  );

  const rules = apl.rules.filter(
    (rule) =>
      (rule.condition === undefined && spells(rule).some((spell) => castSpells.has(spell.id))) ||
      results.successes.some((suc) => isRuleEqual(suc.rule, rule)) ||
      results.violations.some((v) => isRuleEqual(v.rule, rule)),
  );

  const highlightIndex = useMemo(
    () => highlightRule && rules.indexOf(highlightRule),
    [rules, highlightRule],
  );

  return (
    <AplRuleList>
      {rules.map((rule, index) => (
        <AplListItem
          key={index}
          highlighted={highlightRule && isRuleEqual(highlightRule, rule)}
          muted={index < (highlightIndex ?? 0)}
        >
          <RuleDescription rule={rule} />
        </AplListItem>
      ))}
    </AplRuleList>
  );
}

export function RuleDescription({ rule }: { rule: AplRule }): JSX.Element {
  if (rule.description) {
    return <>{rule.description}</>;
  }
  return (
    <>
      Cast <RuleSpellsDescription rule={rule} />
      {rule.condition ? ' ' : ''}
      <ConditionDescription prefix="when" rule={rule} tense={Tense.Present} />
      {rule.condition?.tooltip?.() && (
        <TooltipWrapper content={rule.condition.tooltip()}>
          <span>
            {' '}
            <InformationIcon style={{ fontSize: '1em' }} />
          </span>
        </TooltipWrapper>
      )}
    </>
  );
}

function RuleSpellsDescription({ rule }: { rule: AplRule }): JSX.Element {
  return (
    <>
      {spells(rule).map((spell, index) => (
        <React.Fragment key={index}>
          {index > 0 ? ' or ' : ''}
          <SpellLink spell={spell.id} />
        </React.Fragment>
      ))}
    </>
  );
}
