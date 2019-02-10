import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Trans, t } from '@lingui/macro';

import getWipeCount from 'common/getWipeCount';
import { formatDuration } from 'common/format';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';

import DIFFICULTIES from 'game/DIFFICULTIES';
import { findByBossId } from 'raids';

import ProgressBar from './ProgressBar';
import SkullIcon from 'interface/icons/Skull';
import CancelIcon from 'interface/icons/Cancel';

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
      start_time: PropTypes.number.isRequired,
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
      <ul className="list selection">
        {this.constructor.groupByFight(filteredFights).map(pulls => {
          const firstPull = pulls[0];
          const boss = findByBossId(firstPull.boss);

          return (
            <li key={firstPull.id} className="item" style={{ padding: '15px 30px' }}>
              <div className="flex">
                <div className="flex-sub content">
                  {boss && boss.headshot && (
                    <img
                      src={boss.headshot}
                      alt=""
                      style={{ height: '4em', borderRadius: '50%', marginRight: 30 }}
                    />
                  )}
                </div>
                <div className="flex-main">
                  <h2 style={{ marginTop: 0 }}>
                    {DIFFICULTIES[firstPull.difficulty]} {firstPull.name}
                  </h2>
                  <div style={{ margin: -5 }}>
                    {pulls.map(pull => {
                      const duration = Math.round((pull.end_time - pull.start_time) / 1000);
                      const Icon = pull.kill ? SkullIcon : CancelIcon;

                      return (
                        <Link key={pull.id} to={makeAnalyzerUrl(report, firstPull.id, playerId, resultTab)}>
                          <div style={{ display: 'inline-block', width: 100, margin: 5, padding: 5, border: '1px solid #333' }}>
                            <Icon /> {!pull.kill && getWipeCount(fights, pull)}
                            {' '}{formatDuration(duration)}
                            <ProgressBar percentage={pull.kill ? 100 : (10000 - pull.fightPercentage) / 100} width={65} height={8} />
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
          <Trans>You will usually get the most helpful results using raid fights where you're being challenged, such as progress raids.</Trans>
        </li>
      </ul>
    );
  }
}

export default FightSelectionPanelList;
