import { render } from '@testing-library/react';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/rogue';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from 'store';
import { EventType, CastEvent } from 'parser/core/Events';
import { defaultExplainers } from 'interface/guide/components/Apl/violations/claims';
import { build, CheckResult, InternalRule, ResultKind, Violation } from 'parser/shared/metrics/apl';

import { __test, outlawExplainers } from './explainers';

const ability = (spell: Spell) => ({
  guid: spell.id,
  name: spell.name,
  abilityIcon: spell.icon,
});

const cast = (spell: Spell, comboPoints?: { amount: number; cost?: number }): CastEvent =>
  ({
    timestamp: 1000,
    ability: ability(spell),
    type: EventType.Cast,
    sourceID: 1,
    sourceIsFriendly: true,
    classResources: comboPoints
      ? [
          {
            amount: comboPoints.amount,
            max: 5,
            type: RESOURCE_TYPES.COMBO_POINTS.id,
            cost: comboPoints.cost,
          },
        ]
      : undefined,
  }) as CastEvent;

const violation = (
  actual: Spell,
  expected: Spell[],
  comboPoints?: { amount: number; cost?: number },
  rule?: InternalRule,
): Violation => ({
  kind: ResultKind.Violation,
  actualCast: cast(actual, comboPoints),
  expectedCast: expected,
  rule: rule ?? build(expected).rules[0],
});

const resultFor = (
  violations: Violation[],
  successes: CheckResult['successes'] = [],
): CheckResult => ({
  successes,
  violations,
});

// `droppedRule` groups by rule identity, and 12 violations clear both `defaultClaimFilter` gates.
const manyViolations = (
  actual: Spell,
  expected: Spell[],
  comboPoints?: { amount: number; cost?: number },
) => {
  const rule = build(expected).rules[0];
  return Array.from({ length: 12 }, () => violation(actual, expected, comboPoints, rule));
};

describe('Outlaw APL explainers', () => {
  it('keeps the shared default explainers rather than replacing them', () => {
    expect(Object.keys(outlawExplainers)).toEqual(
      expect.arrayContaining(Object.keys(defaultExplainers)),
    );
  });

  it('reports a dropped rule once enough of that rule was missed', () => {
    const violations = manyViolations(SPELLS.DISPATCH, [SPELLS.ROLL_THE_BONES]);
    const apl = build([SPELLS.ROLL_THE_BONES, SPELLS.DISPATCH]);

    const problems = outlawExplainers.droppedRule.claim(apl, resultFor(violations));

    expect(problems).toHaveLength(1);
    expect(problems[0].claims.size).toBe(violations.length);
  });

  it('does not report a problem when the rule was mostly played correctly', () => {
    // One miss against many successes is below defaultClaimFilter's 40% ratio gate.
    const missed = violation(SPELLS.DISPATCH, [SPELLS.ROLL_THE_BONES]);
    const apl = build([SPELLS.ROLL_THE_BONES, SPELLS.DISPATCH]);
    const successes: CheckResult['successes'] = Array.from({ length: 30 }, () => ({
      kind: ResultKind.Success,
      rule: missed.rule,
      actualCast: cast(SPELLS.ROLL_THE_BONES),
    }));

    expect(outlawExplainers.droppedRule.claim(apl, resultFor([missed], successes))).toEqual([]);
  });

  it('does not blame Killing Spree for a Dispatch cast at the Between the Eyes threshold', () => {
    const atThreshold = manyViolations(SPELLS.DISPATCH, [TALENTS.KILLING_SPREE_TALENT], {
      amount: 5,
      cost: 5,
    });
    const apl = build([TALENTS.KILLING_SPREE_TALENT, SPELLS.DISPATCH]);

    expect(outlawExplainers.droppedRule.claim(apl, resultFor(atThreshold))).toEqual([]);
  });

  it('still blames Killing Spree for a Dispatch cast below the threshold', () => {
    const belowThreshold = manyViolations(SPELLS.DISPATCH, [TALENTS.KILLING_SPREE_TALENT], {
      amount: 3,
      cost: 3,
    });
    const apl = build([TALENTS.KILLING_SPREE_TALENT, SPELLS.DISPATCH]);

    expect(outlawExplainers.droppedRule.claim(apl, resultFor(belowThreshold))).toHaveLength(1);
  });

  it('notes Combo Point waste on a low-Combo-Point finisher', () => {
    const badKillingSpree = violation(TALENTS.KILLING_SPREE_TALENT, [SPELLS.ROLL_THE_BONES], {
      amount: 2,
      cost: 2,
    });

    const { container } = render(
      <ReduxProvider store={store}>
        <__test.OutlawViolationNote violation={badKillingSpree} />
      </ReduxProvider>,
    );

    expect(container).toHaveTextContent('This cast only spent 2 Combo Points');
  });

  it('notes Combo Point waste when Adrenaline Rush is cast at high Combo Points', () => {
    const badAdrenalineRush = violation(TALENTS.ADRENALINE_RUSH_TALENT, [SPELLS.DISPATCH], {
      amount: 5,
    });

    const { container } = render(
      <ReduxProvider store={store}>
        <__test.OutlawViolationNote violation={badAdrenalineRush} />
      </ReduxProvider>,
    );

    expect(container).toHaveTextContent('This cast was made with 5 Combo Points');
  });

  it('adds no note when nothing Outlaw-specific went wrong', () => {
    const badSinisterStrike = violation(SPELLS.SINISTER_STRIKE, [SPELLS.PISTOL_SHOT]);

    const { container } = render(
      <ReduxProvider store={store}>
        <__test.OutlawViolationNote violation={badSinisterStrike} />
      </ReduxProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
