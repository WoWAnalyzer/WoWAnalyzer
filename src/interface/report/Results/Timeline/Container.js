import React from 'react';
import PropTypes from 'prop-types';

import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
// import SpellUsable from 'parser/shared/modules/SpellUsable';
// import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';

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
        abilities={parser.getModule(Abilities)}
        buffs={parser.getModule(Buffs)}
        // isAbilityCooldownsAccurate={parser.getModule(SpellUsable).isAccurate}
        // isGlobalCooldownAccurate={parser.getModule(GlobalCooldown).isAccurate}
      />
    );
  }
}

export default Container;
