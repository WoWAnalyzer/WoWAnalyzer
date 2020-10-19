import React from 'react';
import PropTypes from 'prop-types';

import Abilities from 'parser/core/modules/Abilities';
import Buffs from 'parser/core/modules/Buffs';
// import SpellUsable from 'parser/shared/modules/SpellUsable';
// import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';

import Component from './Component';

const Container = props => {
  const { parser } = props;

  return (
    <Component
      parser={parser}
      abilities={parser.getModule(Abilities)}
      buffs={parser.getModule(Buffs)}
      // isAbilityCooldownsAccurate={parser.getModule(SpellUsable).isAccurate}
      // isGlobalCooldownAccurate={parser.getModule(GlobalCooldown).isAccurate}
    />
  );
};

Container.propTypes = {
  parser: PropTypes.shape({
    fight: PropTypes.shape({
      // replace with actual fight interface when converting to TS
      // eslint-disable-next-line @typescript-eslint/camelcase
      start_time: PropTypes.number.isRequired,
      // eslint-disable-next-line @typescript-eslint/camelcase
      end_time: PropTypes.number.isRequired,
    }),
    getModule: PropTypes.func.isRequired,
  }).isRequired,
};

export default Container;
