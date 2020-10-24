import React from 'react';

import SPECS from 'game/SPECS';
import ROLES from 'game/ROLES';
import { CombatantInfoEvent } from 'parser/core/Events';

import PlayerTile from './PlayerTile';
import './PlayerSelection.scss';

const ROLE_SORT_KEY: {[key: string]: number} = {
  [ROLES.TANK]: 0,
  [ROLES.HEALER]: 1,
  [ROLES.DPS.MELEE]: 2,
  //I'm not sure if this is a bug or intended behaviour, But if this is 2 then there is no sort based or range/melle only on dps.
  [ROLES.DPS.RANGED]: 3,
};

function sortPlayers(a: Player, b: Player) {  
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

interface Fight {
  id: number;
}

interface Player { 
  combatant: CombatantInfoEvent;
  fights: Fight[];
  guid: number;
  icon: string;
  id: number;
  name: string;
  region: string;
  server: string;
  type: string;
}

interface Props {
  players: Player[];
  makeUrl: (playerId: string) => void;
}

const PlayerSelection = ({ players, makeUrl }: Props) => (
  <div className="player-selection">
    {players.sort(sortPlayers).map(player => (
      <PlayerTile key={player.guid} player={player} makeUrl={makeUrl} />
    ))}
  </div>
);

export default PlayerSelection;
