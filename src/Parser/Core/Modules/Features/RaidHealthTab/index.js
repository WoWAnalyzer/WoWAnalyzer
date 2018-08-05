import React from 'react';

import ROLES from 'Game/ROLES';
import Analyzer from 'Parser/Core/Analyzer';

import TabComponent from './TabComponent';

class RaidHealthTab extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.spec.role === ROLES.HEALER;
  }

  tab() {
    return {
      title: 'Raid health',
      url: 'raid-health',
      render: () => (
        <TabComponent
          parser={this.owner}
        />
      ),
    };
  }
}

export default RaidHealthTab;
