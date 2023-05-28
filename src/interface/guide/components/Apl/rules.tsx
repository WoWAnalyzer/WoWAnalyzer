import styled from '@emotion/styled';
import { spells, Apl, CheckResult, InternalRule, isRuleEqual } from 'parser/shared/metrics/apl';
import { RuleDescription } from 'parser/shared/metrics/apl/ChecklistRule';
import { useMemo } from 'react';

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
  highlightRule?: InternalRule;
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
