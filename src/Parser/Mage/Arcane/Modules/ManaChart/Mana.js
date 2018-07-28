import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import TabComponent from './TabComponent';

class ManaTab extends Analyzer {

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
