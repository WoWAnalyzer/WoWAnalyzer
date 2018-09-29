import React from 'react';

import ROLES from 'game/ROLES';
import Analyzer from 'parser/core/Analyzer';

import TabComponent from './TabComponent';

class ManaTab extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.spec.role === ROLES.HEALER;
  }

  tab() {
    return {
      title: 'Mana',
      url: 'mana',
      render: () => (
        <TabComponent
          parser={this.owner}
        />
      ),
    };
  }
}

export default ManaTab;
