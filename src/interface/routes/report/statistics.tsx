import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { useResults } from 'interface/report/Results/ResultsContext';
import { usePageView } from 'interface/useGoogleAnalytics';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import ReportStatistics from 'interface/report/Results/ReportStatistics';

export function Component() {
  const { combatLogParser: parser } = useCombatLogParser();
  const { adjustForDowntime, setAdjustForDowntime, isLoading, results } = useResults();
  usePageView('Results/Statistics');

  if (isLoading || !results) {
    return <ResultsLoadingIndicator />;
  }

  return (
    <ReportStatistics
      parser={parser}
      adjustForDowntime={adjustForDowntime}
      onChangeAdjustForDowntime={(newValue) => setAdjustForDowntime(newValue)}
      statistics={results.statistics}
    />
  );
}
