import React from 'react';
import SPELLS from './SPELLS';
import SpellLink from './SpellLink';

const SpellIcon = ({ id, noLink, ...other }) => {
  const icon = (
    <img
      src={`./img/icons/${SPELLS[id].icon}.jpg`}
      alt={SPELLS[id].name}
      {...other}
    />
  );

  if (noLink) {
    return icon;
  }

  return (
    <SpellLink id={id}>
      {icon}
    </SpellLink>
  );
};
SpellIcon.propTypes = {
  id: React.PropTypes.number.isRequired,
  noLink: React.PropTypes.bool,
};

export default SpellIcon;
