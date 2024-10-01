import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { useResults } from 'interface/report/Results/ResultsContext';
import { usePageView } from 'interface/useGoogleAnalytics';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import Checklist from 'parser/shared/modules/features/Checklist/Module';
import Overview from 'interface/report/Results/Overview';

export function Component() {
  const { combatLogParser: parser } = useCombatLogParser();
  const { isLoading, results } = useResults();
  usePageView('Results/Overview');

  if (isLoading || !results) {
    return <ResultsLoadingIndicator />;
  }

  const checklist = parser.getOptionalModule(Checklist);
  return (
    <Overview
      guide={parser.buildGuide()}
      checklist={checklist && checklist.render()}
      issues={results.issues}
    />
  );
}
