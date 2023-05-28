import Analyzer from 'parser/core/Analyzer';

import TabComponent from '../ManaChart/TabComponent';

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
