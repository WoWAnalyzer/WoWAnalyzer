import Spell from 'common/SPELLS/Spell';
import { useAnalyzer } from 'interface/guide';
import { ViolationExplainer } from 'interface/guide/components/Apl/violations/claims';
import { InternalRule } from 'parser/shared/metrics/apl';
import BaseCelestialAnalyzer from '../spells/BaseCelestialAnalyzer';

export const filterCelestial = (
  explainer: ViolationExplainer<{ rule: InternalRule; spell: Spell }>,
): typeof explainer => ({
  ...explainer,
  claim: (apl, result) =>
    explainer.claim(apl, result).filter(({ claims }) => {
      const celestial = useAnalyzer(BaseCelestialAnalyzer);
      if (celestial) {
        celestial.celestialWindows.forEach((end, start) => {
          claims.forEach((violation) => {
            if (violation.actualCast.timestamp >= start && violation.actualCast.timestamp <= end) {
              claims.delete(violation);
            }
          });
        });
      }
      return claims;
    }),
});

export default filterCelestial;

