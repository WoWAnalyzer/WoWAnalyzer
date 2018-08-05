import React from 'react';
import PropTypes from 'prop-types';

import Combatant from 'Parser/Core/Combatant';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import Stats from './Stats';
import Talents from './Talents';
import Gear from './Gear';

class CharacterTab extends React.PureComponent {
  static propTypes = {
    statTracker: PropTypes.objectOf(StatTracker).isRequired,
    combatant: PropTypes.objectOf(Combatant).isRequired,
  };

  render() {
    const { statTracker, combatant } = this.props;

    return (
      <div style={{ padding: '35px 30px' }}>
        <div className="row" style={{ marginBottom: 30 }}>
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
      </div>
    );
  }
}

export default CharacterTab;
