import BOSS_PHASES_STATE from 'interface/report/BOSS_PHASES_STATE';
import EVENT_PARSING_STATE from 'interface/report/EVENT_PARSING_STATE';
import Panel from 'interface/Panel';
import LoadingBar from 'interface/LoadingBar';
import { useResults } from 'interface/report/Results/ResultsContext';

const ResultsLoadingIndicator = () => {
  const {
    loadingStatus: {
      progress,
      isLoadingParser,
      isLoadingEvents,
      bossPhaseEventsLoadingState,
      isLoadingCharacterProfile,
      isLoadingPhases,
      isFilteringEvents,
      parsingState,
    },
  } = useResults();

  return (
    <div className="container" style={{ marginBottom: 40 }}>
      <Panel title="Loading..." className="loading-indicators">
        <LoadingBar progress={progress} style={{ marginBottom: 30 }} />

        <div className="row">
          <div className="col-md-8">Spec analyzer from WoWAnalyzer</div>
          <div className={`col-md-4 ${isLoadingParser ? 'loading' : 'ok'}`}>
            {isLoadingParser ? 'Loading...' : 'OK'}
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">Player events from Warcraft Logs</div>
          <div className={`col-md-4 ${isLoadingEvents ? 'loading' : 'ok'}`}>
            {isLoadingEvents ? 'Loading...' : 'OK'}
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">Boss events from Warcraft Logs</div>
          <div
            className={`col-md-4 ${
              bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING
                ? 'loading'
                : bossPhaseEventsLoadingState === BOSS_PHASES_STATE.SKIPPED
                ? 'skipped'
                : 'ok'
            }`}
          >
            {bossPhaseEventsLoadingState === BOSS_PHASES_STATE.SKIPPED && 'Skipped'}
            {bossPhaseEventsLoadingState === BOSS_PHASES_STATE.LOADING && 'Loading...'}
            {bossPhaseEventsLoadingState === BOSS_PHASES_STATE.DONE && 'OK'}
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">Character info from Blizzard</div>
          <div className={`col-md-4 ${isLoadingCharacterProfile ? 'loading' : 'ok'}`}>
            {isLoadingCharacterProfile ? 'Loading...' : 'OK'}
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">Analyzing phases</div>
          <div className={`col-md-4 ${isLoadingPhases ? 'loading' : 'ok'}`}>
            {isLoadingPhases ? 'Loading...' : 'OK'}
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">Filtering events</div>
          <div className={`col-md-4 ${isFilteringEvents ? 'loading' : 'ok'}`}>
            {isFilteringEvents ? 'Loading...' : 'OK'}
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">Analyzing events</div>
          <div
            className={`col-md-4 ${
              parsingState === EVENT_PARSING_STATE.WAITING
                ? 'waiting'
                : parsingState === EVENT_PARSING_STATE.PARSING
                ? 'loading'
                : 'ok'
            }`}
          >
            {parsingState === EVENT_PARSING_STATE.WAITING && 'Waiting'}
            {parsingState === EVENT_PARSING_STATE.PARSING && 'Loading...'}
            {parsingState === EVENT_PARSING_STATE.DONE && 'OK'}
          </div>
        </div>
      </Panel>
    </div>
  );
};
export default ResultsLoadingIndicator;
