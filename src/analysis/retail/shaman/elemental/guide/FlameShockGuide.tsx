import { GuideProps } from 'interface/guide';
import CombatLogParser from '../CombatLogParser';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../constants';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';

export const FlameShockGuide = ({ modules }: GuideProps<typeof CombatLogParser>) => {
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
