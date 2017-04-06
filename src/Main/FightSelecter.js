import React, { Component } from 'react';
import { Link } from 'react-router';

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

  render() {
    const { report, playerName } = this.props;

    return (
      <div>
        <h1>{report.title} › {playerName}</h1>

        <div className="panel">
          <div className="panel-heading">
            <h2>Select the fight to parse</h2>
          </div>
          <div className="panel-body">
            <ul className="list">
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
