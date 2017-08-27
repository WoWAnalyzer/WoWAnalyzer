// Note: Based on PlayerSelecter
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';

import PlayerSelectionList from './PlayerSelectionList';

class PlayerSelectorHeader extends Component {
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

  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.setRef = this.setRef.bind(this);
  }

  componentDidMount() {
    document.body.addEventListener('click', this.handleDocumentClick);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleDocumentClick);
    ReactTooltip.hide();
  }

  handleClick(event) {
    this.setState({show: !this.state.show});
  }

  handleDocumentClick(event) {
    if (this.ref && !this.ref.contains(event.target)) {
      this.setState({show: false});
    }
  }

  setRef(node) {
    this.ref = node;
  }

  render() {
    const { report, fightId, combatants, selectedPlayerName } = this.props;
    const { show } = this.state;
    return (
      <span ref={this.setRef}>
        <Link onClick={this.handleClick}>{selectedPlayerName}</Link>
        {show &&
          <span className="selectorHeader">
            <div className="panel">
              <div className="panel-body" style={{ padding: 0 }} onClick={this.handleClick}>
                <PlayerSelectionList report={report} fightId={fightId} combatants={combatants}/>
              </div>
            </div>
          </span>}
      </span>
    );
  }
}

export default PlayerSelectorHeader;
