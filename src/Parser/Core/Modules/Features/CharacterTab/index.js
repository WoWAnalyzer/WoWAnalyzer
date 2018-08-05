import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import Component from './Component';

class ChatacterTab extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  render() {
    return (
      <Component
        statTracker={this.statTracker}
        combatant={this.selectedCombatant}
      />
    );
  }
}

export default ChatacterTab;
