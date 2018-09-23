import React from 'react';

import makeAnalyzerUrl from 'Interface/common/makeAnalyzerUrl';

import ReportLoader from './ReportLoader';
import FightSelection from './FightSelection';
import PlayerSelection from './PlayerSelection';
import ConfigLoader from './ConfigLoader';
import EventParser from './EventParser';
import Results from './Results';

/* eslint-disable no-alert */

const Report = props => (
  <ReportLoader>
    {(report, refreshReport) => (
      <FightSelection
        report={report}
        refreshReport={refreshReport}
      >
        {fight => (
          <PlayerSelection
            report={report}
            fight={fight}
          >
            {(player, combatant, combatants) => ( // TODO: Config/parser loader
              <ConfigLoader
                specId={combatant.specID}
              >
                {config => (
                  <EventParser
                    {...props}
                    report={report}
                    fight={fight}
                    player={player}
                    combatants={combatants}
                    config={config}
                  >
                    {parser => (
                      <Results
                        parser={parser}
                        characterProfile={parser.characterProfile}
                        makeTabUrl={tab => makeAnalyzerUrl(report, fight.id, player.id, tab)}
                      />
                    )}
                  </EventParser>
                )}
              </ConfigLoader>
            )}
          </PlayerSelection>
        )}
      </FightSelection>
    )}
  </ReportLoader>
);

export default Report;
