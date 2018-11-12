import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

import Component from './Component/index';

// TODO: Remove and make part of interface/Report/Results and async load (chunk)
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
