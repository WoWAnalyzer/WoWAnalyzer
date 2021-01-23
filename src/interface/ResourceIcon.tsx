import React from 'react';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import ResourceLink from './ResourceLink';
import Icon from './Icon';

interface Props extends Omit<React.ComponentProps<typeof Icon>, 'id' | 'icon'> {
  id: number;
  noLink?: boolean;
}

const ResourceIcon = ({ id, noLink, ...others }: Props) => {
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

export default ResourceIcon;
