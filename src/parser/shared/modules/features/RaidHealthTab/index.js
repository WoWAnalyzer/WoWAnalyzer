import React from 'react';

import ROLES from 'game/ROLES';
import Analyzer from 'parser/core/Analyzer';

import TabComponent from './TabComponent/index';

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
