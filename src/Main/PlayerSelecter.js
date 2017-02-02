import React, { Component } from 'react';

const PALADIN_TYPE = 'Paladin';

class PlayerSelecter extends Component {
  static propTypes = {
    report: React.PropTypes.shape({
      title: React.PropTypes.string.isRequired,
      friendlies: React.PropTypes.arrayOf(React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        type: React.PropTypes.string.isRequired,
        name: React.PropTypes.string.isRequired,
      })),
    }),
    onSelectPlayer: React.PropTypes.func.isRequired,
  };

  render() {
    const { report, onSelectPlayer } = this.props;

    return (
      <div>
        <h1>{report.title}</h1>

        Select a Paladin to analyze.<br /><br />

        {
          report.friendlies
            .filter(friendly => friendly.type === PALADIN_TYPE)
            .sort((a, b) => a.name > b.name)
            .map(friendly => (
              <div style={{ marginBottom: 10 }} key={`${friendly.id}`}>
                <a href="#" onClick={() => onSelectPlayer(friendly)}>
                    {friendly.name}
                </a>
              </div>
            ))
        }
      </div>
    );
  }
}

export default PlayerSelecter;
