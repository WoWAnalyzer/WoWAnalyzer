import React from 'react';
import PropTypes from 'prop-types';

import traitIdMap from 'common/TraitIdMap';
import corruptionIdMap from 'common/corruptionIdMap';
import getAverageItemLevel from 'game/getAverageItemLevel';
import Combatant from 'parser/core/Combatant';

import './PlayerInfo.scss';
import Azerite from './Azerite';
import Essence from './Essence';
import Corruption from './Corruption';
import Enchants from './Enchants';
import Gear from './Gear';
import Gems from './Gems';
import PlayerGearHeader from './PlayerGearHeader';
import Talents from './Talents';

class PlayerInfo extends React.PureComponent {
  static propTypes = {
    combatant: PropTypes.instanceOf(Combatant).isRequired,
  };

  state = {
    gear: [],
    traits: {},
    talents: [],
    essences: {},
    corruptions: {},
  };

  static getDerivedStateFromProps(props) {
    const { combatant } = props;
    return {
      gear: _parseGear(combatant._combatantInfo.gear),
      traits: _parseTraits(combatant._combatantInfo.artifact),
      talents: _parseTalents(combatant._combatantInfo.talents),
      essences: combatant._combatantInfo.heartOfAzeroth,
      corruptions: _parseCorruption(combatant._combatantInfo.gear),
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
          <div className="player-details-corruptions">
            <Corruption corruptions={this.state.corruptions} />
          </div>
        </div>
      </div>
    );
  }
}

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

function _parseCorruption(gear) {
  const corruptionBySpellId = {};
  gear.forEach((item) => {
    const bonusId = item.bonusIDs?.find(x => Object.keys(corruptionIdMap)
      .includes(x.toString()));
    if (bonusId === undefined) {
      return;
    }
    const corr = corruptionIdMap[bonusId];

    if (!corruptionBySpellId[corr.spellId]) {
      corruptionBySpellId[corr.spellId] = {
        name: corr.name,
        corruption: corr.corruption,
        rank: corr.rank,
        count: 1,
      };
    } else {
      corruptionBySpellId[corr.spellId].count += 1;
    }
  });
  return corruptionBySpellId;
}

export default PlayerInfo;
