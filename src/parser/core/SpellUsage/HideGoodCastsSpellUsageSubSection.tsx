import { ComponentPropsWithoutRef, useMemo } from 'react';
import SpellUsageSubSection from 'parser/core/SpellUsage/SpellUsageSubSection';
import { SpellUse, spellUseToBoxRowEntry, useSpellUsageContext } from 'parser/core/SpellUsage/core';
import { useInfo } from 'interface/guide';
import { qualitativePerformanceToNumber } from 'common/combineQualitativePerformances';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';

type HideGoodCastsSpellUsageSubSectionProps = Omit<
  ComponentPropsWithoutRef<typeof SpellUsageSubSection>,
  'performances'
> & {
  spellUseToPerformance?: (use: SpellUse) => BoxRowEntry;
};

/**
 * A wrapper around {@link SpellUsageSubSection} that will filter out {@link SpellUse}s with a
 * {@link SpellUse#performance} value of {@link QualitativePerformance.Perfect} or
 * {@link QualitativePerformance.Good}.
 */
const HideGoodCastsSpellUsageSubSection = ({
  spellUseToPerformance,
  uses,
  ...others
}: HideGoodCastsSpellUsageSubSectionProps) => {
  const { hideGoodCasts } = useSpellUsageContext();
  const info = useInfo();

  const filteredUses = useMemo(
    () =>
      uses.filter(
        (use) =>
          !hideGoodCasts ||
          qualitativePerformanceToNumber(use.performance) <
            qualitativePerformanceToNumber(QualitativePerformance.Good),
      ),
    [hideGoodCasts, uses],
  );
  const performances = useMemo(
    () =>
      filteredUses.map((spellUse) =>
        spellUseToPerformance
          ? spellUseToPerformance(spellUse)
          : spellUseToBoxRowEntry(spellUse, info?.fightStart ?? 0),
      ),
    [filteredUses, info?.fightStart, spellUseToPerformance],
  );

  return <SpellUsageSubSection performances={performances} uses={filteredUses} {...others} />;
};

export default HideGoodCastsSpellUsageSubSection;
