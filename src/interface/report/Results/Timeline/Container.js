import React from 'react';
import PropTypes from 'prop-types';

import SpellHistory from 'parser/shared/modules/SpellHistory';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import Channeling from 'parser/shared/modules/Channeling';
import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TimelineBuffEvents from 'parser/shared/modules/TimelineBuffEvents';

import Component from './Component';

class Container extends React.PureComponent {
  static propTypes = {
    parser: PropTypes.shape({
      fight: PropTypes.shape({
        start_time: PropTypes.number.isRequired,
        end_time: PropTypes.number.isRequired,
      }),
      getModule: PropTypes.func.isRequired,
    }).isRequired,
  };

  render() {
    const { parser } = this.props;

    return (
      <Component
        parser={parser}
        start={parser.fight.start_time}
        end={parser.fight.end_time}
        historyBySpellId={parser.getModule(SpellHistory).historyBySpellId}
        globalCooldownHistory={parser.getModule(GlobalCooldown).history}
        channelHistory={parser.getModule(Channeling).history}
        abilities={parser.getModule(Abilities)}
        buffs={parser.getModule(Buffs)}
        abilityTracker={parser.getModule(AbilityTracker)}
        deaths={parser.getModule(DeathTracker).deaths}
        resurrections={parser.getModule(DeathTracker).resurrections}
        isAbilityCooldownsAccurate={parser.getModule(SpellUsable).isAccurate}
        isGlobalCooldownAccurate={parser.getModule(GlobalCooldown).isAccurate}
        buffEvents={parser.getModule(TimelineBuffEvents).buffHistoryBySpellId}
      />
    );
  }
}

export default Container;
