import React, { Component } from 'react';
import { Link } from 'react-router';

const PALADIN_TYPE = 'Paladin';

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
    }),
  };

  render() {
    const { report } = this.props;

    return (
      <div style={{ width: 650 }}>
        <h1>Paladin selection</h1>

        <div className="panel">
          <div className="panel-heading">
            <h2>Select the Paladin you wish to analyze</h2>
          </div>
          <div className="panel-body">
            <ul className="list">
              {
                report.friendlies
                  .filter(friendly => friendly.type === PALADIN_TYPE)
                  .sort((a, b) => a.name > b.name)
                  .map(friendly => (
                    <li key={`${friendly.id}`}>
                      <Link to={`/report/${report.code}/${friendly.name}`}>
                        {friendly.name}
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

export default PlayerSelecter;
