import React from 'react';

import Tab from 'Main/Tab';
import SpellTimeline from './SpellTimeline';

class TimelineTab extends React.PureComponent {
  render() {
    return (
      <Tab style={{ padding: 0 }}>
        <div className="text-muted" style={{ padding: 10 }}>
          This timeline shows the cooldowns of your spells to better illustrate issues with your cast efficiency. The accuracy of this timeline greatly depends on the completion status of your spec.
        </div>
        <SpellTimeline {...this.props} />
      </Tab>
    );
  }
}

export default TimelineTab;
