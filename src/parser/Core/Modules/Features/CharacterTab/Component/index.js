import React from 'react';
import PropTypes from 'prop-types';

import Combatant from 'parser/core/Combatant';
import StatTracker from 'parser/core/modules/StatTracker';

import './CharacterTab.css';
import Stats from './Stats';
import Talents from './Talents';
import Gear from './Gear';
import Race from './Race';
import Azerite from './Azerite';

class CharacterTab extends React.PureComponent {
  static propTypes = {
    statTracker: PropTypes.instanceOf(StatTracker).isRequired,
    combatant: PropTypes.instanceOf(Combatant).isRequired,
  };

  render() {
    const { statTracker, combatant } = this.props;

    return (
      <div className="character-tab">
        <div className="row">
          <div className="col-sm-6">
            <Stats statTracker={statTracker} />
          </div>
          <div className="col-sm-6">
            <Talents talents={combatant.talents} />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <Gear gear={Object.values(combatant._gearItemsBySlotId)} />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <Azerite azerite={combatant.traitsBySpellId} />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <Race race={combatant.race} />
          </div>
        </div>
      </div>
    );
  }
}

export default CharacterTab;
