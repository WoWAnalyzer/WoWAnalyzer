// Note: Based on PlayerSelecter
import React from 'react';
import PropTypes from 'prop-types';

import SelectorBase from './SelectorBase';
import PlayerSelectionList from './PlayerSelectionList';

class PlayerSelectorHeader extends SelectorBase {
  static propTypes = {
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

  render() {
    const { report, fightId, combatants, selectedPlayerName, ...others } = this.props;
    const { show } = this.state;
    return (
      <div ref={this.setRef} {...others}>
        <a onClick={this.handleClick}>{selectedPlayerName}</a>
        {show && (
          <span className="selectorHeader">
            <div className="panel">
              <div className="panel-heading">
                <h2>Select the player you wish to analyze</h2>
              </div>
              <div className="panel-body" style={{ padding: 0 }} onClick={this.handleClick}>
                <PlayerSelectionList report={report} fightId={fightId} combatants={combatants} />
              </div>
            </div>
          </span>
        )}
      </div>
    );
  }
}

export default PlayerSelectorHeader;
