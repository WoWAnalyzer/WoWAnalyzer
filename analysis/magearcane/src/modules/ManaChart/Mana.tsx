import Analyzer from 'parser/core/Analyzer';
import React from 'react';

import TabComponent from './TabComponent';

class ManaTab extends Analyzer {
  tab() {
    return {
      title: 'Mana',
      url: 'mana',
      render: () => <TabComponent parser={this.owner} />,
    };
  }
}

export default ManaTab;
