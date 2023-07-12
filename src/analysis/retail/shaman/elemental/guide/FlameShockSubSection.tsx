import { GuideProps } from 'interface/guide';
import CombatLogParser from '../CombatLogParser';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../constants';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';

/**
 * The guide sub-section about Flame Shock for Elemental Shamans.
 * The flameshock module is shared with all shaman specs so this element is the
 * guide tailored to elemental shamans.
 */
export const FlameShockSubSection = ({ modules }: GuideProps<typeof CombatLogParser>) => {
  const explanation = <>TODO</>;
  const data = modules.flameShock.statistic();

  return (
    <ExplanationAndDataSubSection
      title="Flame Shock"
      explanationPercent={GUIDE_EXPLANATION_PERCENT_WIDTH}
      explanation={explanation}
      data={data}
    />
  );
};
