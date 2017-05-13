import React, { Component } from 'react';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';

import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';

import makeAnalyzerUrl from './makeAnalyzerUrl';

class PlayerSelecter extends Component {
  static propTypes = {
    report: React.PropTypes.shape({
      code: React.PropTypes.string.isRequired,
      title: React.PropTypes.string.isRequired,
      friendlies: React.PropTypes.arrayOf(React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        type: React.PropTypes.string.isRequired,
        name: React.PropTypes.string.isRequired,
      })),
    }).isRequired,
    fightId: React.PropTypes.number.isRequired,
    combatants: React.PropTypes.arrayOf(React.PropTypes.shape({

    })).isRequired,
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { report, fightId, combatants } = this.props;

    console.log(combatants);

    return (
      <div>
        <h1>
          <div className="back-button">
            <Link to="/" data-tip="Change report">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          Player selection
        </h1>

        <div className="panel">
          <div className="panel-heading">
            <h2>Select the player you wish to analyze</h2>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <ul className="list selection players">
              {
                report.friendlies
                  .sort((a, b) => a.name > b.name)
                  .map(friendly => {
                    const combatant = combatants.find(combatant => combatant.sourceID === friendly.id);
                    if (!combatant) {
                      return null;
                    }
                    const config = AVAILABLE_CONFIGS.find(config => config.spec.id === combatant.specID);
                    if (!config) {
                      return null;
                    }
                    const spec = config.spec;
                    const specClassName = spec.className.replace(' ', '');

                    return (
                      <li key={`${friendly.id}`}>
                        <Link to={makeAnalyzerUrl(report.code, fightId, friendly.name)}>
                          <img src={`./specs/${specClassName}-${spec.specName.replace(' ', '')}.jpg`} alt="Spec logo" />{' '}
                          {friendly.name} ({spec.specName} {spec.className})
                        </Link>
                      </li>
                    );
                  })
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerSelecter;
