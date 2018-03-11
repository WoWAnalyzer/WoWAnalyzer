import React from 'react';
import PropTypes from 'prop-types';

import Tab from 'Main/Tab';
import Danger from 'common/Alert/Danger';

import SpellTimeline from './SpellTimeline';

class TimelineTab extends React.PureComponent {
  static propTypes = {
    showCooldowns: PropTypes.bool,
    showGlobalCooldownDuration: PropTypes.bool,
  };

  render() {
    const { showCooldowns, showGlobalCooldownDuration } = this.props;

    return (
      <Tab style={{ padding: '10px 22px' }}>
        <div className="text-muted">
          This timeline shows the cooldowns of your spells to better illustrate issues with your cast efficiency. The accuracy of this timeline greatly depends on the completion status of your spec.
        </div>
        {!showCooldowns && (
          <Danger style={{ marginTop: 10, marginBottom: 10 }}>
            Spell cooldown durations could not be shown because this spec's spell cooldown durations have not been properly configured yet. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.
          </Danger>
        )}
        {!showGlobalCooldownDuration && (
          <Danger style={{ marginTop: 10, marginBottom: 10 }}>
            Because this spec's global cooldown durations do not appear to have been properly configured yet, the global cooldown durations and downtime statistic could not be shown. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.
          </Danger>
        )}
        <SpellTimeline
          {...this.props}
          style={{
            marginLeft: -22,
            marginRight: -22,
          }}
        />
      </Tab>
    );
  }
}

export default TimelineTab;
