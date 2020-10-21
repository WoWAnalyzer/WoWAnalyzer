import React from 'react';
import PropTypes from 'prop-types';

import traitIdMap from 'common/TraitIdMap';
import getAverageItemLevel from 'game/getAverageItemLevel';
import Combatant from 'parser/core/Combatant';

import './PlayerInfo.scss';
import Azerite from './Azerite';
import Essence from './Essence';
import Enchants from './Enchants';
import Gear from './Gear';
import Gems from './Gems';
import PlayerGearHeader from './PlayerGearHeader';
import Talents from './Talents';

function _parseTalents(talents) {
  return talents.reduce((talentsByRow, { id }) => talentsByRow.concat(id), []);
}
function _parseTraits(traits) {
  const traitsBySlot = {};
  traits.forEach(({ traitID, slot }) => {
    const spellId = traitIdMap[traitID];
    if (spellId === undefined) {
      return;
    }
    if (!traitsBySlot[slot]) {
      traitsBySlot[slot] = [];
    }
    traitsBySlot[slot].push(spellId);
  });

  return traitsBySlot;
}
function _parseGear(gear) {
  return gear.reduce((gearItemsBySlotId, item) => gearItemsBySlotId.concat(item), []);
}

class PlayerInfo extends React.PureComponent {
  static propTypes = {
    combatant: PropTypes.instanceOf(Combatant).isRequired,
  };

  state = {
    gear: [],
    traits: {},
    talents: [],
    essences: [],
  };

  static getDerivedStateFromProps(props) {
    const { combatant } = props;
    return {
      gear: _parseGear(combatant._combatantInfo.gear),
      traits: _parseTraits(combatant._combatantInfo.artifact),
      talents: _parseTalents(combatant._combatantInfo.talents),
      essences: combatant._combatantInfo.heartOfAzeroth,
    };
  }

  get averageIlvl() {
    return getAverageItemLevel(this.state.gear);
  }

  render() {
    const { combatant } = this.props;

    const background = combatant.characterProfile && combatant.characterProfile.thumbnail ? `https://render-${combatant.characterProfile.region}.worldofwarcraft.com/character/${combatant.characterProfile.thumbnail.replace('avatar', 'main')}` : '/img/fallback-character.jpg';

    return (
      <div className="player-info">
        <div className="player-background" style={{ backgroundImage: `url(${background})` }}>
          <div className="player-gear">
            <PlayerGearHeader player={combatant} averageIlvl={this.averageIlvl} />
            <Gear gear={this.state.gear} player={combatant} />
            <Gems gear={this.state.gear} />
            <Enchants gear={this.state.gear} />
          </div>
        </div>
        <div className="player-details">
          <div className="player-details-talents">
            <Talents talents={this.state.talents} />
          </div>
          <div className="player-details-traits">
            <Azerite azerite={this.state.traits} />
          </div>
          <div className="player-details-essences">
            <Essence essences={this.state.essences} />
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerInfo;
