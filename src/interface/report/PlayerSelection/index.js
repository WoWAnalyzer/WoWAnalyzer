import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SPECS from 'game/SPECS';
import ROLES from 'game/ROLES';
import { fetchCharacter } from 'interface/actions/characters';
import { getCharactersById } from 'interface/selectors/characters';

import PlayerTile from './PlayerTile';
import PlayerInfo from './PlayerInfo';
import './PlayerSelection.scss';

const ROLE_SORT_KEY = {
  [ROLES.TANK]: 0,
  [ROLES.HEALER]: 1,
  [ROLES.DPS.MELEE]: 2,
  [ROLES.DPS.RANGED]: 2,
};
function roleSortKey(player) {
  const spec = SPECS[player.combatant.specID];
  return ROLE_SORT_KEY[spec.role];
}
function sortPlayers(a, b) {
  const aRoleSortKey = roleSortKey(a);
  const bRoleSortKey = roleSortKey(b);

  if (aRoleSortKey !== bRoleSortKey) {
    return aRoleSortKey - bRoleSortKey;
  }

  const aSpecSortKey = a.spec.className;
  const bSpecSortKey = b.spec.className;
  if (aSpecSortKey !== bSpecSortKey) {
    return aSpecSortKey.localeCompare(bSpecSortKey);
  }

  return a.name.localeCompare(b.name);
}

class PlayerSelection extends React.PureComponent {
  static propTypes = {
    players: PropTypes.arrayOf(PropTypes.object).isRequired,
    charactersById: PropTypes.object.isRequired,
    fetchCharacter: PropTypes.func.isRequired,
    makeUrl: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.load();
    this.state = {
      selectedPlayer: null,
    };
  }

  load() {
    const { players, charactersById, fetchCharacter } = this.props;
    return players.filter(player => !charactersById[player.guid]).map(player => {
      return fetchCharacter(player.guid, player.region, player.realm, player.name).catch(err => {
        console.error('An error occured fetching', player, '. The error:', err);
      });
    });
  }

  handlePlayerClick(player) {
    if (this.state.selectedPlayer === player) {
      this.setState({selectedPlayer: null});
    } else {
      this.setState({selectedPlayer: player});
    }
  }

  render() {
    const { players, charactersById, makeUrl } = this.props;

    players.forEach(player => {
      const character = charactersById[player.guid];
      player.parsable = true;
      if (player.combatant.error) {
        player.parsable = false;
        player.error = 'Warcraft Logs ran into an error parsing the log and is not giving us all the necessary information. Please update your Warcraft Logs Uploader and reupload your log to try again.';
      }

      player.avatar = character && character.thumbnail ? `https://render-${character.region}.worldofwarcraft.com/character/${character.thumbnail.replace('avatar','inset')}` : '/img/fallback-character.jpg';
      player.background = character && character.thumbnail ? `https://render-${character.region}.worldofwarcraft.com/character/${character.thumbnail.replace('avatar','main')}` : '/img/fallback-character.jpg';
      player.spec = SPECS[player.combatant.specID];
      player.analysisUrl = makeUrl(player.id);
    });

    return (
      <div className={`player-selection-container${this.state.selectedPlayer ? ' show-info' : ''}`}>
        <div className="player-selection">
          {players.sort(sortPlayers).map(player => (
            <PlayerTile
              key={player.guid}
              player={player}
              selectedPlayer={this.state.selectedPlayer}
              analysisUrl={player.analysisUrl}
              handleClick={() => this.handlePlayerClick(player)}
            />
          ))}
        </div>
        <div className="player-info">
          {this.state.selectedPlayer && <PlayerInfo player={this.state.selectedPlayer} />}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  charactersById: getCharactersById(state),
});
export default connect(
  mapStateToProps,
  {
    fetchCharacter,
  }
)(PlayerSelection);
