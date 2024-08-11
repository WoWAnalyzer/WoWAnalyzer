import { useConfig } from 'interface/report/ConfigContext';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { useResults } from 'interface/report/Results/ResultsContext';
import { usePageView } from 'interface/useGoogleAnalytics';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import StatTracker from 'parser/shared/modules/StatTracker';
import Character from 'interface/report/Results/CharacterTab';
import EncounterStats from 'interface/report/Results/EncounterStats';
import DIFFICULTIES from 'game/DIFFICULTIES';

export function Component() {
  const config = useConfig();
  const { combatLogParser: parser } = useCombatLogParser();
  const { isLoading } = useResults();
  usePageView('Results/Character');

  if (isLoading) {
    return <ResultsLoadingIndicator />;
  }

  const statTracker = parser.getModule(StatTracker);
  return (
    <div className="container">
      <Character statTracker={statTracker} combatant={parser.selectedCombatant} />

      <EncounterStats
        config={config}
        currentBoss={parser.fight.boss}
        difficulty={parser.fight.difficulty ?? DIFFICULTIES.LFR_RAID}
        duration={parser.fight.end_time - parser.fight.start_time}
        combatant={parser.selectedCombatant}
      />
    </div>
  );
}
