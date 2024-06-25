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
import DIFFICULTIES from 'game/DIFFICULTIES';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';
import { useResults } from 'interface/report/Results/ResultsContext';
import { useConfig } from 'interface/report/ConfigContext';
import { useParams } from 'react-router-dom';
import { usePageView } from 'interface/useGoogleAnalytics';

const LazyTimelineTab = lazyLoadComponent(
  () =>
    retryingPromise(() =>
      import(/* webpackChunkName: 'TimelineTab' */ './TimelineTab').then(
        (exports) => exports.default,
      ),
    ),
  0,
);
const LazyEventsTab = lazyLoadComponent(() =>
  retryingPromise(() =>
    import(/* webpackChunkName: 'EventsTab' */ 'interface/EventsTab').then(
      (exports) => exports.default,
    ),
  ),
);
const LazyDebugAnnotationsTab = lazyLoadComponent(() =>
  retryingPromise(() =>
    import('interface/DebugAnnotationsTab').then(({ default: Component }) => Component),
  ),
);

export const OverviewTab = () => {
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
};

export const StatisticsTab = () => {
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
};

export const TimelineTab = () => {
  const { combatLogParser: parser } = useCombatLogParser();
  const { isLoading } = useResults();
  usePageView('Results/Timeline');

  if (isLoading) {
    return <ResultsLoadingIndicator />;
  }

  return <LazyTimelineTab parser={parser} />;
};

export const EventsTab = () => {
  const { combatLogParser: parser } = useCombatLogParser();
  const { isLoading } = useResults();
  usePageView('Results/Events');

  if (isLoading) {
    return <ResultsLoadingIndicator />;
  }

  return (
    <div className="container">
      <LazyEventsTab parser={parser} />
    </div>
  );
};

export const DebugAnnotationsTab = () => {
  const { combatLogParser } = useCombatLogParser();
  const { isLoading } = useResults();

  if (isLoading) {
    return <ResultsLoadingIndicator />;
  }
  return (
    <div className="container">
      <LazyDebugAnnotationsTab parser={combatLogParser} />
    </div>
  );
};

export const CharacterTab = () => {
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
};

export const AboutTab = () => {
  const config = useConfig();
  usePageView('Results/About');
  return (
    <div className="container">
      <About config={config} />

      <ResultsChangelogTab changelog={config.changelog} />
    </div>
  );
};

export const DefaultTab = () => {
  const { resultTab } = useParams();
  const { isLoading, results } = useResults();
  usePageView('Results/CustomTab', resultTab);

  if (isLoading || !results) {
    return <ResultsLoadingIndicator />;
  }

  const tab = results.tabs.find((tab) => tab.url === resultTab);

  return (
    <div className="container">
      <ErrorBoundary>{tab ? tab.render() : '404 tab not found'}</ErrorBoundary>
    </div>
  );
};
