import React from 'react';
import PropTypes from 'prop-types';

import Tab from 'Main/Tab';

import SpellTimeline from './SpellTimeline';

class TimelineTab extends React.PureComponent {
  static propTypes = {
    showCooldowns: PropTypes.bool,
  };

  render() {
    const { showCooldowns } = this.props;

    return (
      <Tab style={{ padding: 0 }}>
        <div className="text-muted" style={{ padding: 10 }}>
          This timeline shows the cooldowns of your spells to better illustrate issues with your cast efficiency. The accuracy of this timeline greatly depends on the completion status of your spec.
        </div>
        {!showCooldowns && (
          <div className="alert alert-danger">
            Spell cooldown durations could not be shown because this spec's spell cooldown durations have not been properly configured yet. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.
          </div>
        )}
        <SpellTimeline {...this.props} />
      </Tab>
    );
  }
}

export default TimelineTab;
