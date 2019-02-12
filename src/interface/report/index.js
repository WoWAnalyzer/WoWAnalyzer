import React from 'react';
import PropTypes from 'prop-types';

import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';

import ReportLoader from './ReportLoader';
import FightSelection from './FightSelection';
import PlayerLoader from './PlayerLoader';
import ConfigLoader from './ConfigLoader';
import PatchChecker from './PatchChecker';
import SupportChecker from './SupportChecker';
import ParserLoader from './ParserLoader';
import EventsLoader from './EventsLoader';
import BossPhaseEventsLoader from './BossPhaseEventsLoader';
import CharacterProfileLoader from './CharacterProfileLoader';
import EventParser from './EventParser';
import Results from './Results';
import EVENT_PARSING_STATE from './EVENT_PARSING_STATE';

class ResultsLoader extends React.PureComponent {
  static propTypes = {
    config: PropTypes.object.isRequired,
    report: PropTypes.object.isRequired,
    fight: PropTypes.object.isRequired,
    player: PropTypes.object.isRequired,
    combatants: PropTypes.array,
  };

  constructor() {
    super();
    this.state = {
      isLoadingParser: true,
      parserClass: null,
      isLoadingEvents: true,
      events: null,
      isLoadingBossPhaseEvents: true,
      bossPhaseEvents: null,
      isLoadingCharacterProfile: true,
      characterProfile: null,
      parsingState: EVENT_PARSING_STATE.WAITING,
      parsingEventsProgress: null,
      parser: null,
    };
    this.handleParserLoader = this.handleParserLoader.bind(this);
    this.handleEventsLoader = this.handleEventsLoader.bind(this);
    this.handleBossPhaseEventsLoader = this.handleBossPhaseEventsLoader.bind(this);
    this.handleCharacterProfileLoader = this.handleCharacterProfileLoader.bind(this);
    this.handleEventsParser = this.handleEventsParser.bind(this);
  }

  handleParserLoader(isLoadingParser, parserClass) {
    this.setState({
      isLoadingParser,
      parserClass,
    });
    return null;
  }
  handleEventsLoader(isLoadingEvents, events) {
    this.setState({
      isLoadingEvents,
      events,
    });
    return null;
  }
  handleBossPhaseEventsLoader(isLoadingBossPhaseEvents, bossPhaseEvents) {
    this.setState({
      isLoadingBossPhaseEvents,
      bossPhaseEvents,
    });
    return null;
  }
  handleCharacterProfileLoader(isLoadingCharacterProfile, characterProfile) {
    this.setState({
      isLoadingCharacterProfile,
      characterProfile,
    });
    return null;
  }
  handleEventsParser(isParsingEvents, parsingEventsProgress, parser) {
    this.setState({
      parsingState: isParsingEvents ? EVENT_PARSING_STATE.PARSING : EVENT_PARSING_STATE.DONE,
      parsingEventsProgress,
      parser,
    });
    return null;
  }

  get progress() {
    return (
      (!this.state.isLoadingParser ? 0.05 : 0)
      + (!this.state.isLoadingEvents ? 0.05 : 0)
      + (!this.state.isLoadingBossPhaseEvents ? 0.05 : 0)
      + (!this.state.isLoadingCharacterProfile ? 0.05 : 0)
      + (this.state.parsingEventsProgress * 0.75)
    );
  }

  render() {
    const { config, report, fight, player, combatants } = this.props;

    return (
      <>
        {/* Load these different api calls asynchronously */}
        <ParserLoader
          config={config}
        >
          {this.handleParserLoader}
        </ParserLoader>
        <EventsLoader
          report={report}
          fight={fight}
          player={player}
        >
          {this.handleEventsLoader}
        </EventsLoader>
        <BossPhaseEventsLoader
          report={report}
          fight={fight}
          player={player}
        >
          {this.handleBossPhaseEventsLoader}
        </BossPhaseEventsLoader>
        <CharacterProfileLoader
          report={report}
          player={player}
        >
          {this.handleCharacterProfileLoader}
        </CharacterProfileLoader>

        {!this.state.isLoadingParser && !this.state.isLoadingEvents && !this.state.isLoadingBossPhaseEvents && !this.state.isLoadingCharacterProfile && (
          <EventParser
            report={report}
            fight={fight}
            player={player}
            combatants={combatants}
            parserClass={this.state.parserClass}
            characterProfile={this.state.characterProfile}
            bossPhaseEvents={this.state.bossPhaseEvents}
            events={this.state.events}
          >
            {this.handleEventsParser}
          </EventParser>
        )}

        <Results
          isLoading={this.isLoading}
          isLoadingParser={this.state.isLoadingParser}
          isLoadingEvents={this.state.isLoadingEvents}
          isLoadingBossPhaseEvents={this.state.isLoadingBossPhaseEvents}
          isLoadingCharacterProfile={this.state.isLoadingCharacterProfile}
          parsingState={this.state.parsingState}
          progress={this.progress}
          report={report}
          fight={fight}
          player={player}
          characterProfile={this.state.characterProfile}
          parser={this.state.parser}
          makeTabUrl={tab => makeAnalyzerUrl(report, fight.id, player.id, tab)}
        />
      </>
    );
  }
}

const Report = () => (
  // TODO: Error boundary so all sub components don't need the errorHandler with the silly withRouter dependency. Instead just throw the error and let the boundary catch it - if possible.
  <ReportLoader>
    {(report, refreshReport) => (
      <PatchChecker
        report={report}
      >
        <FightSelection
          report={report}
          refreshReport={refreshReport}
        >
          {fight => (
            <PlayerLoader
              report={report}
              fight={fight}
            >
              {(player, combatant, combatants) => (
                <ConfigLoader
                  specId={combatant.specID}
                >
                  {config => (
                    <SupportChecker
                      config={config}
                      report={report}
                      fight={fight}
                      player={player}
                    >
                      <ResultsLoader
                        config={config}
                        report={report}
                        fight={fight}
                        player={player}
                        combatants={combatants}
                      />
                    </SupportChecker>
                  )}
                </ConfigLoader>
              )}
            </PlayerLoader>
          )}
        </FightSelection>
      </PatchChecker>
    )}
  </ReportLoader>
);

export default Report;
