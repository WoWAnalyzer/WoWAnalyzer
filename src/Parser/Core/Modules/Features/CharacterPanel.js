import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Gear from 'Main/Gear';
import StatsDisplay from './StatsDisplay';
import TalentsDisplay from './TalentsDisplay';

class CharacterPanel extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statsDisplay: StatsDisplay,
    talentsDisplay: TalentsDisplay,
  };

  render() {
    return (
      <div className="panel" style={{ border: 0, alignContent: 'center' }}>
        <div className="row">
          <div className="col-md-6" style={{ padding: 20 }}>
            {this.statsDisplay.render()}
          </div>
          <div className="col-md-6" style={{ padding: 20 }}>
            {this.talentsDisplay.render()}
          </div>
        </div>
        <div className="panel-heading" style={{ boxShadow: 'none', borderBottom: 0 }}>
          <h2>
            Equipped Gear
          </h2>
        </div>
        <div>
          <Gear selectedCombatant={this.combatants.selected} />
        </div>
      </div>
    );
  }
}

export default CharacterPanel;
