// Note: Based on PlayerSelecter
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';

import PlayerSelectionList from './PlayerSelectionList';

class PlayerSelectorHeader extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    callbackSelectors: PropTypes.func.isRequired,
    selectedPlayerName: PropTypes.string.isRequired,
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      friendlies: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      })),
    }).isRequired,
    fightId: PropTypes.number.isRequired,
    combatants: PropTypes.arrayOf(PropTypes.shape({

    })).isRequired,
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  handleClick(event) {
    this.props.callbackSelectors('Players', !this.props.show);
  }

  render() {
    const { report, fightId, combatants, selectedPlayerName, show } = this.props;
    return (
      <span>
        <Link onClick={this.handleClick}>{selectedPlayerName}</Link>
        {show &&
          <span className="selectorHeader">
            <div className="panel">
              <div className="panel-body" style={{ padding: 0 }}>
                <PlayerSelectionList report={report} onClick={this.handleClick} fightId={fightId} combatants={combatants}/>
              </div>
            </div>
          </span>}
      </span>
    );
  }
}

export default PlayerSelectorHeader;
