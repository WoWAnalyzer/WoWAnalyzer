import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Gear from 'Main/Gear';
import StatsDisplay from './StatsDisplay';
import TalentsDisplay from './TalentsDisplay';

class CharacterPanel extends Analyzer {
  static dependencies = {
    statsDisplay: StatsDisplay,
    talentsDisplay: TalentsDisplay,
  };

  render() {
    return (
      <div style={{ padding: '35px 30px' }}>
        <div className="row" style={{ marginBottom: 30 }}>
          <div className="col-sm-6">
            {this.statsDisplay.render()}
          </div>
          <div className="col-sm-6">
            {this.talentsDisplay.render()}
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <Gear selectedCombatant={this.selectedCombatant} />
          </div>
        </div>
      </div>
    );
  }
}

export default CharacterPanel;
