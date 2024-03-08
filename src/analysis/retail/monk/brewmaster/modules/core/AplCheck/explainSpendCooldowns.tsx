import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import {
  ActualCastDescription,
  minClaimCount,
  ViolationExplainer,
} from 'interface/guide/components/Apl/violations/claims';
import SpellLink from 'interface/SpellLink';
import { InternalRule, isRuleEqual } from 'parser/shared/metrics/apl';
import { dump_cd_rule } from '../AplCheck';

type Data = null;

const joinSpellLinks = (spells: Spell[]) =>
  spells.slice(1).reduce(
    (prev, spell, index, arr) => {
      const joiner = index === arr.length - 1 ? ' or ' : ', ';
      return (
        <>
          {prev}
          {joiner}
          <SpellLink spell={spell} />
        </>
      );
    },
    <SpellLink spell={spells[0]} />,
  );

export const tigerPalmSpamExplanation: ViolationExplainer<Data> = {
  render() {
    return (
      <>
        You frequently used un-empowered <SpellLink spell={SPELLS.TIGER_PALM} /> rather than using
        cooldowns during the <strong>Spend Cooldowns</strong> block of the rotation.
      </>
    );
  },
  describe({ violation }) {
    return (
      <>
        <p>
          <ActualCastDescription event={violation.actualCast} />
        </p>
        <p>
          At this point, you were in the <strong>Spend Cooldowns</strong> block of the rotation and
          should have used {joinSpellLinks(violation.expectedCast)}
        </p>
      </>
    );
  },
  claim(_apl, result) {
    const violations = result.violations.filter(
      (violation) =>
        isRuleEqual(violation.rule, dump_cd_rule) &&
        violation.actualCast.ability.guid === SPELLS.TIGER_PALM.id,
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
  },
};

export const filterDropped = (
  explainer: ViolationExplainer<{ rule: InternalRule; spell: Spell }>,
): typeof explainer => ({
  ...explainer,
  claim: (apl, result) =>
    explainer.claim(apl, result).filter(({ data }) => !isRuleEqual(dump_cd_rule, data.rule)),
});
