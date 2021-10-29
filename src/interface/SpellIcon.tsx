import React from 'react';

import Icon from './Icon';
import SpellLink from './SpellLink';
import useSpellInfo from './useSpellInfo';

interface Props extends Omit<React.ComponentProps<typeof Icon>, 'id' | 'icon'> {
  id: number;
  noLink?: boolean;
  alt?: string;
  ilvl?: number;
}

const SpellIcon = ({ id, noLink, alt, ilvl, ...others }: Props) => {
  const spellInfo = useSpellInfo(id);

  const spell = spellInfo || {
    name: 'Spell not recognized',
    icon: 'inv_misc_questionmark',
  };

  const icon = <Icon icon={spell.icon} alt={alt !== '' ? spell.name : ''} {...others} />;

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
