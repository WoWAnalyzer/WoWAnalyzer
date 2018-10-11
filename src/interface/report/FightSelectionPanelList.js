import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { Trans } from '@lingui/macro';

import getWipeCount from 'common/getWipeCount';
import makeAnalyzerUrl from 'interface/common/makeAnalyzerUrl';

import FightSelectionPanelListItem from './FightSelectionPanelListItem';

class FightSelectionPanelList extends Component {
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

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { fights, report, killsOnly, playerId, resultTab } = this.props;

    return (
      <ul className="list selection">
        {fights
          .filter(fight => {
            if (fight.boss === 0) {
              // Hide trashfights
              return false;
            }
            if (killsOnly && fight.kill === false) {
              return false;
            }
            return true;
          })
          .map(fight => (
            <li key={fight.id} className="item selectable">
              <Link to={makeAnalyzerUrl(report, fight.id, playerId, resultTab)}>
                <FightSelectionPanelListItem {...fight} wipes={getWipeCount(report.fights, fight)} />
              </Link>
            </li>
          ))}
        <li className="item clearfix text-muted" style={{ paddingTop: 10, paddingBottom: 10 }}>
          <Trans>You will usually get the most helpful results using raid fights where you're being challenged, such as progress raids.</Trans>
        </li>
      </ul>
    );
  }
}

export default FightSelectionPanelList;
