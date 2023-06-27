
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import talents from 'common/TALENTS/monk';
import { SpellLink, TooltipElement } from 'interface';
import {
  ActualCastDescription,
  minClaimCount,
  ViolationExplainer,
} from 'interface/guide/components/Apl/violations/claims';
import { spells, InternalRule } from 'parser/shared/metrics/apl';

type Data = null;

const claim: ViolationExplainer<Data>['claim'] = (_apl, result) => {
  const violations = result.violations.filter(
    (violation) =>
      violation.actualCast.ability.guid === SPELLS.SPINNING_CRANE_KICK_BRM.id &&
      violation.expectedCast.some((spell) => spell.id === SPELLS.TIGER_PALM.id),
  );

  if (violations.length < minClaimCount(result)) {
    return [];
  }

  return [
    {
      claims: new Set(violations),
      data: null,
    },
  ];
};
const render: ViolationExplainer<Data>['render'] = () => (
  <>
    You frequently replaced <SpellLink id={SPELLS.TIGER_PALM} /> with{' '}
    <SpellLink id={SPELLS.SPINNING_CRANE_KICK_BRM}>SCK</SpellLink>, even when only a single enemy
    was present.
  </>
);
const describe: ViolationExplainer<Data>['describe'] = ({ violation }) => (
  <>
    <p>
      <ActualCastDescription event={violation.actualCast} />.
    </p>
    <p>
      This cast only hit one enemy. With the{' '}
      <TooltipElement content="The damage of Charred Passions was reduced by 50%.">
        recent nerf
      </TooltipElement>
      , it is not worth casting <SpellLink id={SPELLS.SPINNING_CRANE_KICK_BRM} /> on single target
      even when using <SpellLink id={talents.CHARRED_PASSIONS_TALENT} />.
    </p>
  </>
);

const explainSCK: ViolationExplainer<Data> = {
  claim,
  render,
  describe,
};

export const filterSCK = (
  explainer: ViolationExplainer<{ rule: InternalRule; spell: Spell }>,
): typeof explainer => ({
  ...explainer,
  claim: (apl, result) =>
    explainer
      .claim(apl, result)
      .filter(
        ({ data }) =>
          !spells(data.rule).some((spell) => spell.id === SPELLS.TIGER_PALM.id) &&
          data.spell.id !== SPELLS.SPINNING_CRANE_KICK_BRM.id,
      ),
});

export default explainSCK;
