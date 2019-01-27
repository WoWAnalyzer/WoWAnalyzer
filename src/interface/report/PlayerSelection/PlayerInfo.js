import React from 'react';
import PropTypes from 'prop-types';

import { Trans } from '@lingui/macro';

import traitIdMap from 'common/TraitIdMap';

import Azerite from './playerInfo/Azerite';
import Enchants from './playerInfo/Enchants';
import Gear from './playerInfo/Gear';
import Gems from './playerInfo/Gems';
import PlayerGearHeader from './playerInfo/PlayerGearHeader';
import Talents from './playerInfo/Talents';

const EXCLUDED_ITEM_SLOTS = [3, 17]; // Some Tabards have a higher ilvl than 1 so exclude them from the avg ilvl (not sure about shirts, but including them)

class PlayerInfo extends React.PureComponent {
  static propTypes = {
    player: PropTypes.object.isRequired,
  };

  state = {
    gear: [],
    traits: {},
    talents: [],
  };

  static getDerivedStateFromProps(props) {
    const { player } = props;
    return {
      gear: _parseGear(player.combatant.gear),
      traits: _parseTraits(player.combatant.artifact),
      talents: _parseTalents(player.combatant.talents),
    };
  }

  get averageIlvl() {
    const gear = this.state.gear;

    const filteredGear = gear.filter((item, slotId) => !EXCLUDED_ITEM_SLOTS.includes(slotId));
    return filteredGear.reduce((total, item) => total + item.itemLevel, 0 ) / filteredGear.length;
  }

  render() {
    const { player } = this.props;
    return (
      <>
        <div className="player-background" style={{ backgroundImage: `url(${player.background})` }}>
          <div className="player-gear">
            <PlayerGearHeader player={player} averageIlvl={this.averageIlvl} />
            <Gear gear={this.state.gear} player={player} />
            <Gems gear={this.state.gear} />
            <Enchants gear={this.state.gear} />
          </div>
        </div>
        <a href={player.analysisUrl} className="btn btn-primary analyze">
          <Trans>Analyze</Trans> <span className="glyphicon glyphicon-chevron-right" aria-hidden />
        </a>
        <div className="player-details">
          <div className="player-details-talents">
            <Talents talents={this.state.talents} />
          </div>
          <div className="player-details-traits">
            <Azerite azerite={this.state.traits} />
          </div>
        </div>
      </>
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

export default PlayerInfo;
