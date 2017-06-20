import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';

import Fight from './Fight';
import makeAnalyzerUrl from './makeAnalyzerUrl';
import getWipeCount from './getWipeCount';

class FightSelecter extends Component {
  static propTypes = {
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

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { report } = this.props;

    return (
      <div>
        <h1>
          <div className="back-button">
            <Link to={`/report/${report.code}`} data-tip="Back to player selection">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          {report.title}
          </h1>

        <div className="panel">
          <div className="panel-heading">
            <h2>Select the fight to parse</h2>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <ul className="list selection">
              {
                report.fights
                  .filter(fight => fight.boss !== 0)
                  .map(fight => (
                    <li key={`${fight.id}`}>
                      <Link to={makeAnalyzerUrl(report.code, fight.id)}>
                        <Fight {...fight} wipes={getWipeCount(report, fight)} />
                      </Link>
                    </li>
                  ))
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default FightSelecter;
