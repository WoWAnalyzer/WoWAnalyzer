import React from 'react';
import SPELLS from './SPELLS';
import SpellLink from './SpellLink';

const SpellIcon = ({ id }) => (
  <SpellLink id={id}>
    <img
      src={`./img/icons/${SPELLS[id].icon}.jpg`}
      alt={SPELLS[id].name}
    />
  </SpellLink>
);
SpellIcon.propTypes = {
  id: React.PropTypes.number.isRequired,
};

export default SpellIcon;
