import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import EncounterStats from 'Main/EncounterStats';

class EncounterPanel extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  render() {
    console.info(this.combatants.selected._combatantInfo.specID);
    return (
      <div className="panel" style={{ border: 0, alignContent: 'center' }}>
        <EncounterStats currentBoss={this.owner.fight.boss} difficulty={this.owner.fight.difficulty} spec={this.combatants.selected._combatantInfo.specID} />
      </div>
    );
  }
}

export default EncounterPanel;
