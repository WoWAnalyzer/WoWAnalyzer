import React from 'react';
import PropTypes from 'prop-types';

import Combatant from 'Parser/Core/Combatant';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import './CharacterTab.css';
import Stats from './Stats';
import Talents from './Talents';
import Gear from './Gear';
import Race from './Race';

class CharacterTab extends React.PureComponent {
  static propTypes = {
    statTracker: PropTypes.objectOf(StatTracker).isRequired,
    combatant: PropTypes.objectOf(Combatant).isRequired,
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
            <Race race={combatant.race} />
          </div>
        </div>
      </div>
    );
  }
}

export default CharacterTab;
