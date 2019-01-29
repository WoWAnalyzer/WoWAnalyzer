import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import RoleIcon from 'common/RoleIcon';
import SpecIcon from 'common/SpecIcon';
import { getClassName, getName as getRoleName } from 'game/ROLES';
import getAverageItemLevel from 'game/getAverageItemLevel';
import { i18n } from 'interface/RootLocalizationProvider';
import Icon from 'common/Icon';

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
          handleClick();
        }}
        onDoubleClick={() => {
          clearTimeout(this.timeout);
          history.push(analysisUrl);
        }}
      >
        <div className="role" />
        <div className="card">
          <div className="avatar" style={{ backgroundImage: `url(${player.avatar})` }} />
          <div className="about">
            <h1
              className={player.spec.className.replace(' ', '')}
              // The name can't always fit so use a tooltip. We use title instead of the tooltip library for this because we don't want it to be distracting and the tooltip library would popup when hovering just to click an item, while this has a delay.
              title={player.name}
            >
              {player.name}
            </h1>
            <small
              title={`${player.spec.specName} ${player.spec.className}`}
            >
              <SpecIcon id={player.spec.id} /> {player.spec.specName} {player.spec.className}
            </small>
            <div className="flex text-muted text-small">
              <div className="flex-main">
                <Icon icon="inv_helmet_03" /> {Math.round(getAverageItemLevel(player.combatant.gear))}
              </div>
              <div className="flex-main text-right" />
            </div>
          </div>
        </div>
      </Link>
    );
  }
}

export default withRouter(PlayerTile);
