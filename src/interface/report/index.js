import React from 'react';

import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';

import ReportLoader from './ReportLoader';
import FightSelection from './FightSelection';
import BossEventLoader from './BossEventLoader';
import PlayerSelection from './PlayerSelection';
import ConfigLoader from './ConfigLoader';
import PatchChecker from './PatchChecker';
import SupportChecker from './SupportChecker';
import EventParser from './EventParser';
import Results from './Results';

const Report = props => (
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
            <BossEventLoader
              report={report}
              fight={fight}
            >
              {bossEvents => (
                <PlayerSelection
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
                          <EventParser
                            {...props}
                            report={report}
                            fight={fight}
                            player={player}
                            combatants={combatants}
                            config={config}
                            bossEvents={bossEvents}
                          >
                            {parser => (
                              <Results
                                parser={parser}
                                characterProfile={parser.characterProfile}
                                makeTabUrl={tab => makeAnalyzerUrl(report, fight.id, player.id, tab)}
                              />
                            )}
                          </EventParser>
                        </SupportChecker>
                      )}
                    </ConfigLoader>
                  )}
                </PlayerSelection>
              )}
            </BossEventLoader>
          )}
        </FightSelection>
      </PatchChecker>
    )}
  </ReportLoader>
);

export default Report;
