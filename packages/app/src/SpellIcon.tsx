import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from './SpellLink';
import Icon from './Icon';

interface Props extends Omit<React.ComponentProps<typeof Icon>, 'id' | 'icon'> {
  id: number
  noLink?: boolean
  alt?: string
  ilvl?: number
}

const SpellIcon = ({ id, noLink, alt, ilvl, ...others }: Props) => {
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
      alt={alt !== '' ? spell.name : ''}
      {...others}
    />
  );

  if (noLink) {
    return icon;
  }

  return (
    <SpellLink id={id} ilvl={ilvl} icon={false}>
      {icon}
    </SpellLink>
  );
};

export default SpellIcon;
