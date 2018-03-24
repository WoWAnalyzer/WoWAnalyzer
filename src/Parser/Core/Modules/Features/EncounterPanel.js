import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import EncounterStats from 'Main/EncounterStats';

class EncounterPanel extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  render() {
    return (
      <div className="panel" style={{ border: 0, alignContent: 'center' }}>
        <EncounterStats 
          currentBoss={this.owner.fight.boss} 
          difficulty={this.owner.fight.difficulty} 
          player={this.combatants.selected} />
      </div>
    );
  }
}

export default EncounterPanel;
