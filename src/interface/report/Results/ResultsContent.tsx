import CombatLogParser from 'parser/core/CombatLogParser';
import Config from 'parser/Config';
import ParseResults from 'parser/core/ParseResults';
import TABS from 'interface/report/Results/TABS';
import Checklist from 'parser/shared/modules/features/Checklist/Module';
import Overview from 'interface/report/Results/Overview';
import ReportStatistics from 'interface/report/Results/ReportStatistics';
import StatTracker from 'parser/shared/modules/StatTracker';
import Character from 'interface/report/Results/CharacterTab';
import EncounterStats from 'interface/report/Results/EncounterStats';
import About from 'interface/report/Results/About';
import ResultsChangelogTab from 'interface/ResultsChangelogTab';
import ErrorBoundary from 'interface/ErrorBoundary';
import lazyLoadComponent from 'common/lazyLoadComponent';
import retryingPromise from 'common/retryingPromise';
import ResultsLoadingIndicator from 'interface/report/Results/ResultsLoadingIndicator';
import { ComponentProps } from 'react';

const TimelineTab = lazyLoadComponent(
  () =>
    retryingPromise(() =>
      import(/* webpackChunkName: 'TimelineTab' */ './TimelineTab').then(
        (exports) => exports.default,
      ),
    ),
  0,
);
const EventsTab = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'EventsTab' */ 'interface/EventsTab').then(
      (exports) => exports.default,
    ),
  ),
);

interface Props extends ComponentProps<typeof ResultsLoadingIndicator> {
  config: Config;
  isLoading: boolean;
  parser: CombatLogParser;
  results: ParseResults | null;
  selectedTab: string;
  adjustForDowntime: boolean;
  setAdjustForDowntime: (newValue: boolean) => void;
}
const ResultsContent = ({
  config,
  isLoading,
  parser,
  results,
  selectedTab,
  adjustForDowntime,
  setAdjustForDowntime,
  ...others
}: Props) => {
  switch (selectedTab) {
    case TABS.OVERVIEW: {
      if (isLoading || !results) {
        return <ResultsLoadingIndicator {...others} />;
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
    case TABS.STATISTICS:
      if (isLoading || !results) {
        return <ResultsLoadingIndicator {...others} />;
      }
      return (
        <ReportStatistics
          parser={parser}
          adjustForDowntime={adjustForDowntime}
          onChangeAdjustForDowntime={(newValue) => setAdjustForDowntime(newValue)}
          statistics={results.statistics}
        />
      );
    case TABS.TIMELINE:
      if (isLoading) {
        return <ResultsLoadingIndicator {...others} />;
      }
      return <TimelineTab parser={parser} />;
    case TABS.EVENTS:
      if (isLoading) {
        return <ResultsLoadingIndicator {...others} />;
      }
      return (
        <div className="container">
          <EventsTab parser={parser} />
        </div>
      );
    case TABS.CHARACTER: {
      if (isLoading) {
        return <ResultsLoadingIndicator {...others} />;
      }
      const statTracker = parser.getModule(StatTracker);
      return (
        <div className="container">
          <Character statTracker={statTracker} combatant={parser.selectedCombatant} />

          <EncounterStats
            config={config}
            currentBoss={parser.fight.boss}
            difficulty={parser.fight.difficulty}
            spec={parser.selectedCombatant._combatantInfo.specID}
            duration={parser.fight.end_time - parser.fight.start_time}
            combatant={parser.selectedCombatant}
          />
        </div>
      );
    }
    case TABS.ABOUT: {
      return (
        <div className="container">
          <About config={config} />

          <ResultsChangelogTab changelog={config.changelog} />
        </div>
      );
    }
    default: {
      if (isLoading || !results) {
        return <ResultsLoadingIndicator {...others} />;
      }

      const tab = results.tabs.find((tab) => tab.url === selectedTab);

      return (
        <div className="container">
          <ErrorBoundary>{tab ? tab.render() : '404 tab not found'}</ErrorBoundary>
        </div>
      );
    }
  }
};

export default ResultsContent;
