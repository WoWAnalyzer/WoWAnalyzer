import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { useResults } from 'interface/report/Results/ResultsContext';
import { usePageView } from 'interface/useGoogleAnalytics';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import EventsTabFn from 'interface/EventsTab';

export function Component() {
  const { combatLogParser: parser } = useCombatLogParser();
  const { isLoading } = useResults();
  usePageView('Results/Events');

  if (isLoading) {
    return <ResultsLoadingIndicator />;
  }

  return (
    <div className="container">
      <EventsTabFn parser={parser} />
    </div>
  );
}
