import React from 'react';

import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';

import ReportLoader from './ReportLoader';
import FightSelection from './FightSelection';
import PlayerSelection from './PlayerSelection';
import ConfigLoader from './ConfigLoader';
import EventParser from './EventParser';
import Results from './Results';

const Report = props => (
  // TODO: Error boundary so all sub components don't need the errorHandler with the silly withRouter dependency. Instead just throw the error and let the boundary catch it - if possible.
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
            {(player, combatant, combatants) => (
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
