import { RETAIL_EXPANSION } from 'game/Expansion';
import getAverageItemLevel from 'game/getAverageItemLevel';
import { ConduitLink } from 'interface';
import Combatant from 'parser/core/Combatant';
import { Item } from 'parser/core/Events';

import './PlayerInfo.scss';
import PlayerGearHeader from './PlayerGearHeader';
import PlayerInfoEnchants from './PlayerInfoEnchants';
import PlayerInfoGear from './PlayerInfoGear';
import PlayerInfoGems from './PlayerInfoGems';
import PlayerInfoTalents from './PlayerInfoTalents';

function _parseTalents(talents: TalentsType[]): number[] {
  return talents.reduce(
    (talentsByRow: number[], talent: TalentsType) => talentsByRow.concat(talent.id),
    [],
  );
}

function _parseGear(gear: Item[]) {
  return gear.reduce((gearItemsBySlotId: Item[], item: Item) => gearItemsBySlotId.concat(item), []);
}

interface TalentsType {
  icon: string;
  id: number;
}

interface Props {
  combatant: Combatant;
}

interface Conduit {
  icon: string;
  itemLevel?: number | undefined;
  rank: number;
  spellID: number;
  traitID: number;
}

function renderConduit(conduit: Conduit) {
  return (
    <div
      key={conduit.spellID}
      className="col-md-12 flex-main"
      style={{ textAlign: 'left', margin: '5px auto' }}
    >
      <div className="row">
        <div className="col-md-10">
          <ConduitLink
            id={conduit.spellID}
            iconStyle={{ width: '2em', height: '2em', border: '1px solid', marginRight: 10 }}
          />
        </div>
      </div>
    </div>
  );
}

const PlayerInfo = ({ combatant }: Props) => {
  const isRetail = combatant.owner.config.expansion === RETAIL_EXPANSION;
  const gear: Item[] = _parseGear(combatant._combatantInfo.gear);
  const talents: number[] = _parseTalents(combatant._combatantInfo.talents);
  const averageIlvl = getAverageItemLevel(gear);
  const conduits = combatant._combatantInfo.conduits;
  const background =
    combatant.characterProfile && combatant.characterProfile.thumbnail
      ? `https://render-${
          combatant.characterProfile.region
        }.worldofwarcraft.com/character/${combatant.characterProfile.thumbnail.replace(
          'avatar',
          'main',
        )}`
      : '/img/fallback-character.jpg';

  return (
    <div className="player-info">
      <div className="player-background" style={{ backgroundImage: `url(${background})` }}>
        <div className="player-gear">
          <PlayerGearHeader player={combatant} averageIlvl={averageIlvl} />
          <PlayerInfoGear gear={gear} />
          <PlayerInfoGems gear={gear} />
          <PlayerInfoEnchants gear={gear} />
        </div>
      </div>
      <div className="player-details">
        <div className="player-details-talents">
          {isRetail && <PlayerInfoTalents talents={talents} />}
        </div>
        {isRetail && (
          <div className="player-details-talents">
            <h3>Conduits </h3>
            {conduits?.map((conduit) => renderConduit(conduit))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerInfo;
