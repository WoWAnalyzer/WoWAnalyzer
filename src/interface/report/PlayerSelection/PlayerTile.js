import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import RoleIcon from 'common/RoleIcon';
import SpecIcon from 'common/SpecIcon';
import { getClassName, getName as getRoleName } from 'game/ROLES';
import { i18n } from 'interface/RootLocalizationProvider';

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
      <Link
        to={analysisUrl}
        className={`player ${(selectedPlayer && selectedPlayer.guid === player.guid) ? 'selected' : ''} ${getClassName(player.spec.role)}`}
        onClick={e => {
          e.preventDefault();
          this.timeout = setTimeout(handleClick, 200);
        }}
        onDoubleClick={() => {
          clearTimeout(this.timeout);
          history.push(analysisUrl);
        }}
      >
        <div className="role">
          <div>
            <RoleIcon id={player.spec.role} className="role-icon" /> {i18n._(getRoleName(player.spec.role)(1))}
          </div>
        </div>
        <div className="card">
          <div className="avatar" style={{ backgroundImage: `url(${player.avatar})` }} />
          <div className="about">
            <h1 className={player.spec.className.replace(' ', '')}>{player.name}</h1>
            <small><SpecIcon id={player.spec.id} /> {player.spec.specName} {player.spec.className}</small>
          </div>
        </div>
      </Link>
    );
  }
}

export default withRouter(PlayerTile);
