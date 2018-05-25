import React from 'react';
import PropTypes from 'prop-types';
import RESOURCE_TYPES from './RESOURCE_TYPES';
import ResourceLink from './ResourceLink';
import Icon from './Icon';

const ResourceIcon = ({ id, noLink, ...others }) => {
  if (process.env.NODE_ENV === 'development' && !RESOURCE_TYPES[id]) {
    throw new Error(`Unknown spell: ${id}`);
  }

  const spell = RESOURCE_TYPES[id] || {
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
    <ResourceLink id={id} icon={false}>
      {icon}
    </ResourceLink>
  );
};
ResourceIcon.propTypes = {
  id: PropTypes.number.isRequired,
  noLink: PropTypes.bool,
};

export default ResourceIcon;
