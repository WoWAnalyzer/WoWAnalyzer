import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { useResults } from 'interface/report/Results/ResultsContext';
import { usePageView } from 'interface/useGoogleAnalytics';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import TimelineTab from 'interface/report/Results/TimelineTab';

export function Component() {
  const { combatLogParser: parser } = useCombatLogParser();
  const { isLoading } = useResults();
  usePageView('Results/Timeline');

  if (isLoading) {
    return <ResultsLoadingIndicator />;
  }

  return <TimelineTab parser={parser} />;
}
