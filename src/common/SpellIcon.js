import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from './SPELLS';
import SpellLink from './SpellLink';
import Icon from './Icon';

const SpellIcon = ({ id, noLink, ...others }) => {
  if (process.env.NODE_ENV === 'development' && !SPELLS[id]) {
    throw new Error(`Unknown spell: ${id}`);
  }

  const icon = (
    <Icon
      icon={SPELLS[id].icon}
      alt={SPELLS[id].name}
      {...others}
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
  id: PropTypes.number.isRequired,
  noLink: PropTypes.bool,
};

export default SpellIcon;
