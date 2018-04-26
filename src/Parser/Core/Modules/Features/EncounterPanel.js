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
      <EncounterStats currentBoss={this.owner.fight.boss} difficulty={this.owner.fight.difficulty} spec={this.combatants.selected._combatantInfo.specID} />
    );
  }
}

export default EncounterPanel;
