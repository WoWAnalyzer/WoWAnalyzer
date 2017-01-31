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
      <div className="panel panel-default" style={{ background: '#eee', maxWidth: 600, margin: '0 auto' }}>
        <div className="panel-body">
          <h1 style={{ marginTop: 0 }}>{report.title}</h1>

          Select a player to analyze.<br /><br />

          {
            report.friendlies
              .filter(friendly => friendly.type === PALADIN_TYPE)
              .sort((a, b) => a.name > b.name)
              .map(friendly => (
                <a href="#" onClick={() => onSelectPlayer(friendly)} key={`${friendly.id}`}>
                  <div style={{ paddingBottom: 5 }}>
                    {friendly.name}
                  </div>
                </a>
              ))
          }
        </div>
      </div>
    );
  }
}

export default PlayerSelecter;
