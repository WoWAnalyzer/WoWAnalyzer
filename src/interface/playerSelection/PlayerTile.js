import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import RoleIcon from 'common/RoleIcon';

class PlayerTile extends React.PureComponent {
  static propTypes = {
    player: PropTypes.object.isRequired,
    selectedPlayer: PropTypes.object,
    analysisUrl: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  };

  timeout = null;

  render() {
    const { player, selectedPlayer, analysisUrl, handleClick, history } = this.props;

    if (!player.parsable) {
      return (
        <span
          className="player"
          onClick={() => {
            alert(`This player can not be parsed. ${player.error}`);
          }}
        >
          <div className="card">
            <div className="avatar" style={{ backgroundImage: `url(${player.avatar})` }} />
            <div className="about">
              <h1>{player.name}</h1>
            </div>
          </div>
        </span>
      );
    }

    return (
      <span
        onClick={() => {
          this.timeout = setTimeout(handleClick, 200);
        }}
        onDoubleClick={() => {
          clearTimeout(this.timeout);
          history.push(analysisUrl);
        }}
        className={`player${(selectedPlayer && selectedPlayer.guid === player.guid) ? ' selected' : ''}`}
      >
        <div className="card">
          <div className="avatar" style={{ backgroundImage: `url(${player.avatar})` }}>
            <RoleIcon id={player.spec.role} className="role-icon" />
          </div>
          <div className="about">
            <h1 className={player.spec.className.replace(' ', '')}>{player.name}</h1>
            <small>{player.spec.specName} {player.spec.className}</small>
          </div>
        </div>
      </span>
    );
  }
}

export default withRouter(PlayerTile);
