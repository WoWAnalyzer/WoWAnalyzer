import React from 'react';
import SPELLS from './SPELLS';
import SpellLink from './SpellLink';

const SpellIcon = ({ id, ...other }) => (
  <SpellLink id={id}>
    <img
      src={`./img/icons/${SPELLS[id].icon}.jpg`}
      alt={SPELLS[id].name}
      {...other}
    />
  </SpellLink>
);
SpellIcon.propTypes = {
  id: React.PropTypes.number.isRequired,
};

export default SpellIcon;
