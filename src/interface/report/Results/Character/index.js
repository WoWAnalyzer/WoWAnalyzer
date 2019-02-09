import React from 'react';
import PropTypes from 'prop-types';

import Combatant from 'parser/core/Combatant';
import StatTracker from 'parser/shared/modules/StatTracker';

import './CharacterTab.css';
import PlayerInfo from './PlayerInfo';
import Stats from './Stats';
import Race from './Race';

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
            <PlayerInfo combatant={combatant} />
          </div>
          <div className="col-sm-6">
            <Stats statTracker={statTracker} />

            <Race race={combatant.race} />
          </div>
        </div>
      </div>
    );
  }
}

export default CharacterTab;
