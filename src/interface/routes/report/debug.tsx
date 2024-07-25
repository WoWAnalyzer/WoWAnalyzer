import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { useResults } from 'interface/report/Results/ResultsContext';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import DebugAnnotationsTab from 'interface/DebugAnnotationsTab';

export function Component() {
  const { combatLogParser } = useCombatLogParser();
  const { isLoading } = useResults();

  if (isLoading) {
    return <ResultsLoadingIndicator />;
  }
  return (
    <div className="container">
      <DebugAnnotationsTab parser={combatLogParser} />
    </div>
  );
}
