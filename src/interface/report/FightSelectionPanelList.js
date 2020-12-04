import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Trans } from '@lingui/macro';

import getFightName from 'common/getFightName';
import getWipeCount from 'common/getWipeCount';
import { formatDuration } from 'common/format';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';
import SkullIcon from 'interface/icons/Skull';
import CancelIcon from 'interface/icons/Cancel';
import InformationIcon from 'interface/icons/Information';

import { findByBossId } from 'raids';

import ProgressBar from './ProgressBar';

class FightSelectionPanelList extends React.PureComponent {
  static propTypes = {
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
    fights: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      difficulty: PropTypes.number,
      boss: PropTypes.number.isRequired,
      // use fight interface when converting to TS
      // eslint-disable-next-line @typescript-eslint/camelcase
      start_time: PropTypes.number.isRequired,
      // eslint-disable-next-line @typescript-eslint/camelcase
      end_time: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      kill: PropTypes.bool,
    })),
    killsOnly: PropTypes.bool.isRequired,
    playerId: PropTypes.number,
    resultTab: PropTypes.string,
  };

  static groupByFight(fights) {
    let last = null;
    return fights.reduce((arr, fight) => {
      const isDifferent = last === null || last[0].boss !== fight.boss || last[0].difficulty !== fight.difficulty;
      if (isDifferent) {
        last = [];
        arr.push(last);
      }
      last.push(fight);
      return arr;
    }, []);
  }

  render() {
    const { fights, report, killsOnly, playerId, resultTab } = this.props;

    const filteredFights = fights.filter(fight => {
      if (fight.boss === 0) {
        // Hide trashfights
        return false;
      }
      if (killsOnly && fight.kill === false) {
        return false;
      }
      return true;
    });

    return (
      <ul className="list">
        {this.constructor.groupByFight(filteredFights).map(pulls => {
          const firstPull = pulls[0];
          const boss = findByBossId(firstPull.boss);

          return (
            <li key={firstPull.id} className="item">
              <div className="flex">
                <div className="flex-sub content">
                  {boss && boss.headshot && (
                    <img
                      src={boss.headshot}
                      className="headshot"
                      alt=""
                    />
                  )}
                </div>
                <div className="flex-main">
                  <h2 style={{ marginTop: 0 }}>
                    {getFightName(report, firstPull)}
                  </h2>
                  <div className="pulls">
                    {pulls.map(pull => {
                      const duration = Math.round((pull.end_time - pull.start_time) / 1000);
                      const Icon = pull.kill ? SkullIcon : CancelIcon;

                      return (
                        <Link
                          key={pull.id}
                          to={makeAnalyzerUrl(report, pull.id, playerId, resultTab)}
                          className={`pull ${pull.kill ? 'kill' : 'wipe'}`}
                        >
                          <div className="flex">
                            <div className="flex-main">
                              <Icon /> {pull.kill ? <Trans id="interface.report.fightSelectionPanelList.kill">Kill</Trans> : <Trans id="interface.report.fightSelectionPanelList.wipe">Wipe {getWipeCount(fights, pull)}</Trans>}
                            </div>
                            <div className="flex-sub">
                              <small>{formatDuration(duration)}</small>{' '}
                              <ProgressBar
                                percentage={pull.kill ? 100 : (10000 - pull.fightPercentage) / 100}
                                width={100}
                                height={8}
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        <li className="item clearfix text-muted" style={{ paddingTop: 10, paddingBottom: 10 }}>
          <InformationIcon /> <Trans id="interface.report.fightSelectionPanelList.information">You will usually get the most helpful results using raid fights where you're being challenged, such as progress raids.</Trans>
        </li>
      </ul>
    );
  }
}

export default FightSelectionPanelList;
