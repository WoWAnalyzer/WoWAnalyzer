import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import TabComponent from './TabComponent';

class PetTimelineTab extends Analyzer {
  tab() {
    return {
      title: 'Pet Timeline',
      url: 'pet-timeline',
      order: 3,
      render: () => (
        <TabComponent
          parser={this.owner}
        />
      ),
    };
  }
}

export default PetTimelineTab;
