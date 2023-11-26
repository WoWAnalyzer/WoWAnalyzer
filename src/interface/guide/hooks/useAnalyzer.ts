import Module from 'parser/core/Module';
import { useContext, useMemo } from 'react';
import './Guide.scss';
import GuideContext from '../GuideContext';

/**
 * Get an analysis module from within a Guide section.
 *
 * # Example
 *
 * ```
 * import BrewCDR from 'analysis/retail/monk/brewmaster/modules/core/BrewCDR';
 * import PurifyingBrew from 'analysis/retail/monk/brewmaster/modules/spells/PurifyingBrew';
 *
 * function MySection() {
 *   const cdr = useAnalyzer(BrewCDR);
 *   const pb = useAnalyzer(PurifyingBrew);
 *    // ...
 * }
 *
 * // ... later, in the Guide component
 *
 * function Guide(props) {
 *   return (
 *    // ...
 *    <MySection />
 *    // ...
 *   )
 * }
 * ```
 */
export function useAnalyzer<T extends typeof Module>(moduleType: T): InstanceType<T> | undefined;
export function useAnalyzer(moduleKey: string): Module | undefined;
export function useAnalyzer<T extends typeof Module>(value: string | T) {
  const ctx = useContext(GuideContext);
  return useMemo(() => {
    if (typeof value === 'string') {
      return ctx.modules[value];
    } else {
      return Object.values(ctx.modules).find((module) => module instanceof value) as
        | InstanceType<T>
        | undefined;
    }
  }, [value, ctx]);
}
