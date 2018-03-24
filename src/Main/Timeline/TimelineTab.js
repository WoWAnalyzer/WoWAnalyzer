import React from 'react';
import PropTypes from 'prop-types';

import Tab from 'Main/Tab';
import Danger from 'common/Alert/Danger';
import Info from 'common/Alert/Info';

import SpellTimeline from './SpellTimeline';

const isDevelopment = process.env.NODE_ENV === 'development';

class TimelineTab extends React.PureComponent {
  static propTypes = {
    isAbilityCooldownsAccurate: PropTypes.bool,
    isGlobalCooldownAccurate: PropTypes.bool,
  };

  render() {
    const { isAbilityCooldownsAccurate, isGlobalCooldownAccurate, ...others } = this.props;

    return (
      <Tab style={{ padding: '10px 22px' }}>
        <div className="text-muted">
          This timeline shows the cooldowns of your spells to better illustrate issues with your cast efficiency. The accuracy of this timeline greatly depends on the completion status of your spec.
        </div>
        {!isAbilityCooldownsAccurate && (
          <Danger style={{ marginTop: 10, marginBottom: 10 }}>
            Spell cooldown durations could not be shown because this spec's spell cooldown durations have not been properly configured yet. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/wiki/Abilities#how-to-configure-the-spell-cooldown-durations-properly">this page</a> if you're interested in contributing improvements.
          </Danger>
        )}
        {!isGlobalCooldownAccurate && (
          <Danger style={{ marginTop: 10, marginBottom: 10 }}>
            The global cooldown durations and downtime statistic could not be shown because this spec's global cooldown durations do not appear to have been properly configured yet. See <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> or join us on <a href="https://discord.gg/AxphPxU">Discord</a> if you're interested in contributing this.
          </Danger>
        )}
        {isDevelopment && (!isAbilityCooldownsAccurate || !isGlobalCooldownAccurate) && (
          <Info style={{ marginTop: 10, marginBottom: 10 }}>
            Because you're in development mode no information has been hidden to help you debug. Don't forget to check your browser's console for more information about the current issues.
          </Info>
        )}
        <SpellTimeline
          showCooldowns={isAbilityCooldownsAccurate || isDevelopment}
          showGlobalCooldownDuration={isGlobalCooldownAccurate || isDevelopment}
          {...others}
          style={{
            marginTop: 10,
            marginLeft: -22,
            marginRight: -22,
          }}
        />
      </Tab>
    );
  }
}

export default TimelineTab;
