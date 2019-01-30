import React from 'react';
import PropTypes from 'prop-types';

import SPECS from 'game/SPECS';
import ROLES from 'game/ROLES';

import PlayerTile from './PlayerTile';
import './PlayerSelection.scss';

const ROLE_SORT_KEY = {
  [ROLES.TANK]: 0,
  [ROLES.HEALER]: 1,
  [ROLES.DPS.MELEE]: 2,
  [ROLES.DPS.RANGED]: 2,
};
function sortPlayers(a, b) {
  const aSpec = SPECS[a.combatant.specID];
  const bSpec = SPECS[b.combatant.specID];

  const aRoleSortKey = ROLE_SORT_KEY[aSpec.role];
  const bRoleSortKey = ROLE_SORT_KEY[bSpec.role];

  if (aRoleSortKey !== bRoleSortKey) {
    return aRoleSortKey - bRoleSortKey;
  }

  const aSpecSortKey = aSpec.className;
  const bSpecSortKey = bSpec.className;
  if (aSpecSortKey !== bSpecSortKey) {
    return aSpecSortKey.localeCompare(bSpecSortKey);
  }

  return a.name.localeCompare(b.name);
}

class PlayerSelection extends React.PureComponent {
  static propTypes = {
    players: PropTypes.arrayOf(PropTypes.object).isRequired,
    makeUrl: PropTypes.func.isRequired,
  };

  render() {
    const { players, makeUrl } = this.props;

    return (
      <div className="player-selection">
        {players.sort(sortPlayers).map(player => (
          <PlayerTile
            key={player.guid}
            player={player}
            makeUrl={makeUrl}
          />
        ))}
      </div>
    );
  }
}

export default PlayerSelection;
