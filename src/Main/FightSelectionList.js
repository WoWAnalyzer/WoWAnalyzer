import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import getWipeCount from 'common/getWipeCount';

import Fight from './Fight';
import makeAnalyzerUrl from './makeAnalyzerUrl';

class FightSelectionList extends Component {
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
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { fights, report, killsOnly, playerId } = this.props;
    return (
      <ul className="list selection">
        {
          fights
            .filter(fight => {
              if (fight.boss === 0) {
                return false;
              }
              if (killsOnly && fight.kill === false) {
                return false;
              }
              return true;
            })
            .map(fight => (
              <li key={fight.id} className="item selectable">
                <Link to={makeAnalyzerUrl(report, fight.id, playerId )}>
                  <Fight {...fight} wipes={getWipeCount(report.fights, fight)} />
                </Link>
              </li>
            ))
        }
        <li className="item clearfix text-muted" style={{ paddingTop: 10, paddingBottom: 10 }}>
          You will usually get the best results using logs where you're really being challenged, such as progress raids.
        </li>
      </ul>
    );
  }
}

export default FightSelectionList;
