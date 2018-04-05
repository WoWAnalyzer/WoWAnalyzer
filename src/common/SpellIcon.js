import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from './SPELLS';
import SpellLink from './SpellLink';
import Icon from './Icon';

const SpellIcon = ({ id, noLink, ...others }) => {
  if (process.env.NODE_ENV === 'development' && !SPELLS[id]) {
    throw new Error(`Unknown spell: ${id}`);
  }

  const spell = SPELLS[id] || {
    name: 'Spell not recognized',
    icon: 'inv_misc_questionmark',
  };

  const icon = (
    <Icon
      icon={spell.icon}
      alt={spell.name}
      {...others}
    />
  );

  if (noLink) {
    return icon;
  }

  return (
    <SpellLink id={id} icon={false}>
      {icon}
    </SpellLink>
  );
};
SpellIcon.propTypes = {
  id: PropTypes.number.isRequired,
  noLink: PropTypes.bool,
};

export default SpellIcon;
