import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';


import RoleIcon from 'common/RoleIcon';
import SpecIcon from 'common/SpecIcon';


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
    return (
      <span
        key={player.guid}
        onClick={() => { this.timeout = setTimeout(function(){ handleClick(); }, 200); }}
        onDoubleClick={() => { clearTimeout(this.timeout); history.push(analysisUrl); }}
        className={`player${selectedPlayer && selectedPlayer.guid === player.guid ? ' selected' : ''}`}
      >
        <div className="card">
          <div className="avatar" style={{ backgroundImage: `url(${player.avatar})` }} />
          <div className="about">
            <h1 className={player.spec.className.replace(' ', '')}>{player.name}</h1>
            <small>
              <SpecIcon id={player.spec.id} className="spec-icon" /> {player.spec.specName} {player.spec.className}
            </small>
            <RoleIcon id={player.spec.role} className="role-icon" />
            <div className={`background ${player.spec.className.replace(' ', '')}-bg`} />
          </div>
        </div>
      </span>
    );
  }
}

export default withRouter(PlayerTile);
