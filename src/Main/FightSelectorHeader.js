import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';
import Toggle from 'react-toggle';

import getWipeCount from 'common/getWipeCount';

import Fight from './Fight';
import makeAnalyzerUrl from './makeAnalyzerUrl';

class FightSelectorHeader extends Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    callbackSelectors: PropTypes.func.isRequired,
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
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  handleClick(event) {
    this.props.callbackSelectors('Fights', !this.props.show);
  }

  render() {
    const { report, selectedFightName, parser, show } = this.props;
    const { killsOnly } = this.state;

    return (
      <span>
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
            <div className="panel-body" style={{ padding: 0 }}>
              <ul className="list selection" onClick={this.handleClick}>
                {
                  parser && parser.player &&
                  parser.player.fights.map(f => report.fights[f.id - 1]) // TODO: We should check if the id's match!
                    .filter(fight => {
                      if (!fight) {
                        return false;
                      }
                      if (fight.boss === 0) {
                        return false;
                      }
                      if (killsOnly && fight.kill === false) {
                        return false;
                      }
                      return true;
                    })
                    .map(fight => (
                      <li key={`${fight.id}`} className="item selectable">
                        <Link to={makeAnalyzerUrl(report, fight.id, parser.player.name)}>
                          <Fight {...fight} wipes={getWipeCount(report, fight)} />
                        </Link>
                      </li>
                    ))
                }
              </ul>
            </div>
          </div>
        </span>}
      </span>
    );
  }
}

export default FightSelectorHeader;
