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

  const aRoleSortKey = aSpec ? ROLE_SORT_KEY[aSpec.role] : -1;
  const bRoleSortKey = bSpec ? ROLE_SORT_KEY[bSpec.role] : -1;

  if (aRoleSortKey !== bRoleSortKey) {
    return aRoleSortKey - bRoleSortKey;
  }

  const aSpecSortKey = aSpec ? aSpec.className : '';
  const bSpecSortKey = bSpec ? bSpec.className : '';
  if (aSpecSortKey !== bSpecSortKey) {
    return aSpecSortKey.localeCompare(bSpecSortKey);
  }

  return a.name.localeCompare(b.name);
}

const PlayerSelection = ({ players, makeUrl }) => (
  <div className="player-selection">
    {players.sort(sortPlayers).map(player => (
      <PlayerTile key={player.guid} player={player} makeUrl={makeUrl} />
    ))}
  </div>
);

PlayerSelection.propTypes = {
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
  makeUrl: PropTypes.func.isRequired,
};

export default PlayerSelection;
