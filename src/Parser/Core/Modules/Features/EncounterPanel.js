import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import EncounterStats from 'Interface/Others/Report/Results/EncounterStats';

// TODO: Refactor this module
class EncounterPanel extends Analyzer {
  render() {
    return (
      <EncounterStats currentBoss={this.owner.fight.boss} difficulty={this.owner.fight.difficulty} spec={this.selectedCombatant._combatantInfo.specID} />
    );
  }
}

export default EncounterPanel;
