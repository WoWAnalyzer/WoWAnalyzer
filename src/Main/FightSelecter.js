import React, { Component } from 'react';

import Fight from './Fight';

class FightSelecter extends Component {
  static propTypes = {
    report: React.PropTypes.shape({
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
    onSelectFight: React.PropTypes.func.isRequired,
  };

  render() {
    const { report, onSelectFight } = this.props;

    return (
      <div>
        <h1>{report.title}</h1>

        Select the fight to parse.<br /><br />

        {
          report.fights
            .filter(fight => fight.boss !== 0)
            .map(fight => (
              <a href="#" onClick={() => onSelectFight(fight)} key={`${fight.id}`}>
                <Fight {...fight} style={{ marginBottom: 15 }} />
              </a>
            ))
        }
      </div>
    );
  }
}

export default FightSelecter;
