import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';
import Toggle from 'react-toggle';

import FightSelectionList from './FightSelectionList';

class FightSelectorHeader extends Component {
  static propTypes = {
    selectedFightName: PropTypes.string.isRequired,
    parser: PropTypes.shape(),
    report: PropTypes.shape({
      code: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      fights: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        difficulty: PropTypes.number,
        boss: PropTypes.number.isRequired,
        start_time: PropTypes.number.isRequired,
        end_time: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        kill: PropTypes.bool,
      })),
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      killsOnly: false,
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
    const { report, selectedFightName, parser } = this.props;
    const { killsOnly, show } = this.state;

    return (
      <span ref={this.setRef}>
        <Link onClick={this.handleClick}>{selectedFightName}</Link>
        {show && parser && parser.player &&
        <span className="selectorHeader">
          <div className="panel">
            <div className="panel-heading">
              <div className="row">
                <div className="col-md-8">
                  <h2>Select the fight to parse {parser && parser.player ? ' for ' + parser.player.name : ''}</h2>
                </div>
                <div className="col-md-4 text-right toggle-control action-buttons">
                  <Toggle
                    checked={killsOnly}
                    icons={false}
                    onChange={(event) => this.setState({ killsOnly: event.currentTarget.checked })}
                    id="kills-only-toggle"
                  />
                  <label htmlFor="kills-only-toggle">
                    Kills only
                  </label>
                </div>
              </div>
            </div>
            <div className="panel-body" style={{ padding: 0 }} onClick={this.handleClick}>
            {parser && parser.player &&
              <FightSelectionList
                report={report}
                fights={
                  parser.player.fights.map(f => report.fights[f.id - 1]) // TODO: We should check if the id's match!
                }
                playerName={parser.player.name}
                killsOnly={this.state.killsOnly}
              />
            }
            </div>
          </div>
        </span>}
      </span>
    );
  }
}

export default FightSelectorHeader;
