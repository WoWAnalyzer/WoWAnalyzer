import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import EncounterStats from 'interface/report/Results/EncounterStats';

// TODO: Refactor this module
class EncounterPanel extends Analyzer {
  render() {
    return (
      <EncounterStats currentBoss={this.owner.fight.boss} difficulty={this.owner.fight.difficulty} spec={this.selectedCombatant._combatantInfo.specID} />
    );
  }
}

export default EncounterPanel;
