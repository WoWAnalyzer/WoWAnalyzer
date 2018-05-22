// Note: Based on PlayerSelecter
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getPlayerName } from 'selectors/url/report';

import SelectorBase from './SelectorBase';
import PlayerSelectionList from '../Report/PlayerSelectionList';

class PlayerSelectorHeader extends SelectorBase {
  static propTypes = {
    selectedPlayerName: PropTypes.string.isRequired,
  };

  render() {
    const { selectedPlayerName, ...others } = this.props;
    delete others.dispatch;
    return (
      <div ref={this.setRef} {...others}>
        <a onClick={this.handleClick}>{selectedPlayerName}</a>
        {this.state.show && (
          <span className="selectorHeader">
            <div className="panel">
              <div className="panel-heading">
                <h2>Select the player you wish to analyze</h2>
              </div>
              <div className="panel-body" style={{ padding: 0 }} onClick={this.handleClick}>
                <PlayerSelectionList />
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
