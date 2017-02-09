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
      <div style={{ width: 650 }}>
        <h1>{report.title}</h1>

        Select the fight to parse.<br /><br />

        {
          report.fights
            .filter(fight => fight.boss !== 0)
            .map(fight => (
              <Link to={`/report/${report.code}/${playerName}/${fight.id}`} key={`${fight.id}`}>
                <Fight {...fight} style={{ marginBottom: 15 }} />
              </Link>
            ))
        }
      </div>
    );
  }
}

export default FightSelecter;
