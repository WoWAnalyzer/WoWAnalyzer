import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark, useAnalyzer } from 'interface/guide';
import { ComponentPropsWithoutRef } from 'react';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import { PerformanceUsageRow } from 'parser/core/SpellUsage/core';

import MajorCooldown, { SpellCast } from './MajorCooldown';
import SpellUsageSubSection from '../SpellUsage/SpellUsageSubSection';

const MissingCastBoxEntry = {
  value: QualitativePerformance.Fail,
  tooltip: (
    <PerformanceUsageRow>
      <PerformanceMark perf={QualitativePerformance.Fail} /> Potential cast went unused
    </PerformanceUsageRow>
  ),
};

const PossibleMissingCastBoxEntry = {
  value: QualitativePerformance.Ok,
  tooltip: (
    <PerformanceUsageRow>
      <PerformanceMark perf={QualitativePerformance.Ok} /> Potential cast went unused, but may have
      been intentionally saved to handle a mechanic.
    </PerformanceUsageRow>
  ),
};

type CooldownUsageProps<Cast extends SpellCast> = Omit<
  ComponentPropsWithoutRef<typeof SpellUsageSubSection>,
  'explanation' | 'performance' | 'uses'
> & {
  analyzer: MajorCooldown<Cast>;
};

/**
 * A wrapper around {@link SpellUsageSubSection} that will pull data from a provided
 * {@link MajorCooldown}, as well as check its cast efficiency.
 *
 * Example usage:
 * ```
 * <CooldownUsage analyzer={modules.soulCarver} />
 * ```
 */
const CooldownUsage = <Cast extends SpellCast>({
  analyzer,
  ...others
}: CooldownUsageProps<Cast>) => {
  const castEfficiency = useAnalyzer(CastEfficiency)?.getCastEfficiencyForSpell(analyzer.spell);
  const possibleUses = castEfficiency?.maxCasts ?? 0;
  const performance = analyzer.cooldownPerformance();
  const actualCasts = performance.length;

  if (actualCasts === 0 && possibleUses > 1) {
    // if they didn't cast it and could have multiple times, we call all possible uses bad
    //
    // the possibleUses > 1 check excludes this from happening on very short fights (such as early wipes)
    for (let i = 0; i < possibleUses; i += 1) {
      performance.push(MissingCastBoxEntry);
    }
  } else {
    // if they cast it at least once, have some forgiveness. up to half (rounded up)
    // of possible casts get a yellow color. any beyond that are red.
    for (let i = possibleUses; i > actualCasts; i -= 1) {
      if (i > possibleUses / 2) {
        performance.push(PossibleMissingCastBoxEntry);
      } else {
        performance.push(MissingCastBoxEntry);
      }
    }
  }

  const uses = analyzer.uses;

  return (
    <SpellUsageSubSection
      explanation={analyzer.description()}
      performance={performance}
      uses={uses}
      {...others}
    />
  );
};

export default CooldownUsage;
