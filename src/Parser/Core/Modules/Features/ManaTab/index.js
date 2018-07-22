import React from 'react';

import ROLES from 'common/ROLES';
import Analyzer from 'Parser/Core/Analyzer';

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
