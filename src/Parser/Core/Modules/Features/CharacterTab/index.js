import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import Component from './Component';

// TODO: Remove and make part of Interface/Report/Results and async load (chunk)
class CharacterTab extends Analyzer {
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

export default CharacterTab;
