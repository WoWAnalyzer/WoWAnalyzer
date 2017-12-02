import React from 'react';

import SpellTimeline from './SpellTimeline';

class TimelineTab extends React.PureComponent {
  render() {
    return (
      <SpellTimeline {...this.props} />
    );
  }
}

export default TimelineTab;
