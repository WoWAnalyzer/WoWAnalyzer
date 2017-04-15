import React, { Component } from 'react';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';

import Fight from './Fight';

class FightSelecter extends Component {
  static propTypes = {
    report: React.PropTypes.shape({
      code: React.PropTypes.string.isRequired,
      title: React.PropTypes.string.isRequired,
      fights: React.PropTypes.arrayOf(React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        difficulty: React.PropTypes.number,
        boss: React.PropTypes.number.isRequired,
        start_time: React.PropTypes.number.isRequired,
        end_time: React.PropTypes.number.isRequired,
        name: React.PropTypes.string.isRequired,
        kill: React.PropTypes.bool,
      })),
    }),
    playerName: React.PropTypes.string.isRequired,
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { report, playerName } = this.props;

    return (
      <div>
        <h1>
          <div className="back-button">
            <Link to={`/report/${report.code}`} data-tip="Back to Paladin selection">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          {report.title} › {playerName}
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
                      <Link to={`/report/${report.code}/${playerName}/${fight.id}`}>
                        <Fight {...fight} />
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
