import { useContext, useMemo } from 'react';
import Module from 'parser/core/Module';
import { ModuleList } from '../types';
import GuideContext from '../GuideContext';

/**
 * Get multiple analysis modules from within a Guide section.
 *
 * # Example
 *
 * ```
 * import BrewCDR from 'analysis/retail/monk/brewmaster/modules/core/BrewCDR';
 * import PurifyingBrew from 'analysis/retail/monk/brewmaster/modules/spells/PurifyingBrew';
 *
 * function MySection() {
 *   const analyzers = useAnalyzer([BrewCDR, PurifyingBrew]);
 *   // ...
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
function useAnalyzers<Arr extends { [Key: number]: typeof Module }>(values: Arr): ModuleList<Arr> {
  const ctx = useContext(GuideContext);

  return useMemo(
    () =>
      Object.values(values).map((value) =>
        Object.values(ctx.modules).find((module) => module instanceof (value as typeof Module)),
      ),
    [values, ctx],
  ) as ModuleList<Arr>;
}

export default useAnalyzers;
