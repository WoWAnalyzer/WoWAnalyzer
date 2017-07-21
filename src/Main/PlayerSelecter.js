import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';

import AVAILABLE_CONFIGS from 'Parser/AVAILABLE_CONFIGS';
import UnsupportedSpec from 'Parser/UnsupportedSpec/CONFIG';

import PatreonLink from './PatreonLink';
import makeAnalyzerUrl from './makeAnalyzerUrl';

class PlayerSelecter extends Component {
  static propTypes = {
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

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { report, fightId, combatants } = this.props;

    return (
      <div>
        <h1>
          <div className="back-button">
            <Link to={`/report/${report.code}`} data-tip="Back to fight selection">
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
              {combatants.length === 0 && (
                <li className="text-danger" style={{ padding: '15px 22px' }}>
                  Could not find any players in this report. Make sure the log is recorded with Advanced Combat Logging enabled. You can enable this in-game in the network settings.
                </li>
              )}
              {
                report.friendlies
                  .sort((a, b) => a.name > b.name)
                  .map(friendly => {
                    const combatant = combatants.find(combatant => combatant.sourceID === friendly.id);
                    if (!combatant) {
                      return null;
                    }
                    let config = AVAILABLE_CONFIGS.find(config => config.spec.id === combatant.specID);
                    if (!config) {
                      if (process.env.NODE_ENV === 'development') {
                        config = UnsupportedSpec;
                      } else {
                        return null;
                      }
                    }
                    const spec = config.spec;
                    const specClassName = spec.className.replace(' ', '');

                    return (
                      <li key={friendly.id}>
                        <Link to={makeAnalyzerUrl(report.code, fightId, friendly.name)}>
                          <img src={`/specs/${specClassName}-${spec.specName.replace(' ', '')}.jpg`} alt="Spec logo" />{' '}
                          {friendly.name} ({spec.specName} {spec.className === 'Unsupported' ? `${spec.className} - ${friendly.type}` : spec.className})
                        </Link>
                      </li>
                    );
                  })
              }
            </ul>
          </div>
        </div>

        <div className="panel fade-in delay-3s" style={{ margin: '15px auto 30px', maxWidth: 550, textAlign: 'center' }}>
          <div className="panel-body text-muted">
            If you're not being shown in the list your spec may not be supported yet. The best way to get support for a spec is to add it yourself. Adding specs is easy if you're familiar with JavaScript (ES6), see <a href="https://github.com/MartijnHols/WoWAnalyzer">GitHub</a> and the WoW Analyzer Discord for more information.<br /><br />

            If you're looking to help out development in other ways, please consider donating.<br />

            <PatreonLink />
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerSelecter;
