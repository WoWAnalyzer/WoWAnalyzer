// Note: Based on PlayerSelecter
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getPlayerName } from 'selectors/routing';

import SelectorBase from './SelectorBase';
import PlayerSelectionList from './PlayerSelectionList';

class PlayerSelectorHeader extends SelectorBase {
  static propTypes = {
    selectedPlayerName: PropTypes.string.isRequired,
    combatants: PropTypes.arrayOf(PropTypes.shape({
    })).isRequired,
  };

  render() {
    const { combatants, selectedPlayerName, ...others } = this.props;
    delete others.dispatch;
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
                <PlayerSelectionList combatants={combatants} />
              </div>
            </div>
          </span>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  selectedPlayerName: getPlayerName(state),
});

export default connect(
  mapStateToProps
)(PlayerSelectorHeader);
