import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { useResults } from 'interface/report/Results/ResultsContext';
import { usePageView } from 'interface/useGoogleAnalytics';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import Overview from 'interface/report/Results/Overview';

export function Component() {
  const { combatLogParser: parser } = useCombatLogParser();
  const { isLoading, results } = useResults();
  usePageView('Results/Overview');

  if (isLoading || !results) {
    return <ResultsLoadingIndicator />;
  }

  return <Overview guide={parser.buildGuide()} />;
}
