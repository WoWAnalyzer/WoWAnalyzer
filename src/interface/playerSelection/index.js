import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import SPECS from 'game/SPECS';
import ROLES from 'game/ROLES';
import SpecIcon from 'common/SpecIcon';
import { fetchCharacter } from 'interface/actions/characters';
import { getCharactersById } from 'interface/selectors/characters';

import './PlayerSelection.scss';
import RoleIcon from 'common/RoleIcon';

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

  if (aRoleSortKey === bRoleSortKey) {
    return a.name.localeCompare(b.name);
  }
  return aRoleSortKey - bRoleSortKey;
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
  }

  load() {
    const { players, charactersById, fetchCharacter } = this.props;

    return players.filter(player => !charactersById[player.guid]).map(player => {
      return fetchCharacter(player.guid, player.region, player.realm, player.name).catch(err => {
        console.error('An error occured fetching', player, '. The error:', err);
      });
    });
  }

  render() {
    const { players, charactersById, makeUrl } = this.props;
    
    return (
      <div className="player-selection">
        {players.sort(sortPlayers).map(player => {
          const character = charactersById[player.guid];
          const spec = SPECS[player.combatant.specID];
          const imageSource = character ? `https://render-${character.region}.worldofwarcraft.com/character/${character.thumbnail}` : '/img/fallback-character.jpg';

          return (
            <Link
              key={player.guid}
              to={makeUrl(player.id)}
            >
              <div className="card">
                <div
                  className="avatar"
                  style={{ backgroundImage: `url(${imageSource})` }}
                />
                <div className="about">
                  <h1 className={spec.className.replace(' ', '')}>{player.name}</h1>
                  <small>
                    <SpecIcon id={spec.id} className="spec-icon" /> {spec.specName} {spec.className}
                  </small>
                  <RoleIcon id={spec.role} className="role-icon" />
                  <div className={`background ${spec.className.replace(' ', '')}-bg`} />
                </div>
              </div>
            </Link>
          );
        })}
        <a />
        <a />
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
