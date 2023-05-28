import ROLES from 'game/ROLES';
import SPECS from 'game/SPECS';
import { wclGameVersionToExpansion } from 'game/VERSIONS';
import { CombatantInfoEvent } from 'parser/core/Events';
import Report from 'parser/core/Report';
import getConfig from 'parser/getConfig';

import Player from '../../parser/core/Player';
import PlayerTile from './PlayerTile';

import './PlayerSelection.scss';

const ROLE_SORT_KEY: { [key: string]: number } = {
  [ROLES.TANK]: 0,
  [ROLES.HEALER]: 1,
  //Different sort for range/melee was tested and felt intuitive.
  //Because of this all DPS are treated the same for sorting purposes.
  [ROLES.DPS.MELEE]: 2,
  [ROLES.DPS.RANGED]: 2,
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

interface Props {
  report: Report;
  combatants: CombatantInfoEvent[];
  makeUrl: (playerId: number, build?: string) => string;
}

const PlayerSelection = ({ report, combatants, makeUrl }: Props) => (
  <div className="player-selection">
    {report.friendlies
      .flatMap((friendly) => {
        const combatant = combatants.find((combatant) => combatant.sourceID === friendly.id);
        if (!combatant) {
          return [];
        }
        const exportedCharacter = report.exportedCharacters
          ? report.exportedCharacters.find((char) => char.name === friendly.name)
          : null;

        return [
          {
            ...friendly,
            combatant,
            server: exportedCharacter?.server,
            region: exportedCharacter?.region,
          },
        ];
      })
      .sort(sortPlayers)
      .map((player) => (
        <PlayerTile
          key={player.guid}
          player={player}
          makeUrl={makeUrl}
          config={getConfig(
            wclGameVersionToExpansion(report.gameVersion),
            player.combatant.specID,
            player,
            player.combatant,
          )}
        />
      ))}
  </div>
);

export default PlayerSelection;
