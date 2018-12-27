import React from 'react';
import PropTypes from 'prop-types';

import traitIdMap from 'common/TraitIdMap';

import Azerite from 'parser/shared/modules/features/CharacterTab/Component/Azerite';
import Gear from './Gear';

class PlayerInfo extends React.PureComponent {
  static propTypes = {
    player: PropTypes.object.isRequired,
  };

  render() {
    const { player } = this.props;
    return (
      <>
        <div className="player-background" style={{ backgroundImage: `url(${player.background})` }}>
          <Gear gear={Object.values(this.gear)} player={player} />
        </div>
          <Azerite azerite={this.traits} />
      </>
    );
  }

  get traits() {
    const { player: { combatant } } = this.props;
    return this._parseTraits(combatant.artifact);
  }

  get gear() {
    const { player: { combatant } } = this.props;
    return this._parseGear(combatant.gear);
  }
  
  _parseTraits(traits) {
    const _traitsBySpellId = {};
    traits.forEach(({ traitID, rank }) => {
      const spellId = traitIdMap[traitID];
      if (spellId === undefined) {
        return;
      }
      if (!_traitsBySpellId[spellId]) {
        _traitsBySpellId[spellId] = [];
      }
      _traitsBySpellId[spellId].push(rank);
    });
    return _traitsBySpellId;
  }
  
  _parseGear(gear) {
    const _gearItemsBySlotId = {};
    gear.forEach((item, index) => {
      _gearItemsBySlotId[index] = item;
    });
    return _gearItemsBySlotId;
  }
}

export default PlayerInfo;
