import * as React from 'react';

import Icon from './Icon';
import SpellLink from './SpellLink';
import useSpellInfo from './useSpellInfo';
import Spell from 'common/SPELLS/Spell';

interface Props extends Omit<React.ComponentProps<typeof Icon>, 'id' | 'icon'> {
  spell: number | Spell;
  noLink?: boolean;
  alt?: string;
  ilvl?: number;
}

const SpellIcon = ({ spell, noLink, alt, ilvl, ...others }: Props) => {
  const spellData = spell;
  const spellInfo = useSpellInfo(spellData);

  const spellWithFallback = spellInfo ?? {
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

  const spellId = typeof spell === 'number' ? spell : spell.id;

  if (noLink || spellId <= 1) {
    return icon;
  }

  return (
    <SpellLink spell={spellData} ilvl={ilvl} icon={false}>
      {icon}
    </SpellLink>
  );
};

export default SpellIcon;
