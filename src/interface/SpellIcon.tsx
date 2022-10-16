import * as React from 'react';

import Icon from './Icon';
import SpellLink from './SpellLink';
import useSpellInfo from './useSpellInfo';
import Spell from 'common/SPELLS/Spell';

interface Props extends Omit<React.ComponentProps<typeof Icon>, 'id' | 'icon'> {
  id: number | Spell;
  noLink?: boolean;
  alt?: string;
  ilvl?: number;
}

const SpellIcon = ({ id: spell, noLink, alt, ilvl, ...others }: Props) => {
  const spellInfo = useSpellInfo(spell);

  const spellWithFallback = spellInfo || {
    name: 'Spell not recognized',
    icon: 'inv_misc_questionmark',
  };

  const icon = (
    <Icon
      icon={spellWithFallback.icon}
      alt={alt !== '' ? spellWithFallback.name : ''}
      {...others}
    />
  );

  if (noLink) {
    return icon;
  }

  return (
    <SpellLink id={spell} ilvl={ilvl} icon={false}>
      {icon}
    </SpellLink>
  );
};

export default SpellIcon;
