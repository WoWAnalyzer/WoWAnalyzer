import * as React from 'react';

import Icon from './Icon';
import SpellLink from './SpellLink';
import useSpellInfo from './useSpellInfo';
import Spell from 'common/SPELLS/Spell';

interface BaseProps extends Omit<React.ComponentProps<typeof Icon>, 'id' | 'icon'> {
  noLink?: boolean;
  alt?: string;
  ilvl?: number;
}

interface PropsWithId extends BaseProps {
  /**
   * @deprecated use {@link spell} instead.
   */
  id: number | Spell;
  spell?: never;
}

interface PropsWithSpell extends BaseProps {
  /**
   * @deprecated use {@link spell} instead.
   */
  id?: never;
  spell: number | Spell;
}

type Props = PropsWithId | PropsWithSpell;

const SpellIcon = ({ id, spell, noLink, alt, ilvl, ...others }: Props) => {
  const spellData = spell ?? id;
  const spellInfo = useSpellInfo(spellData);

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
    <SpellLink spell={spellData} ilvl={ilvl} icon={false}>
      {icon}
    </SpellLink>
  );
};

export default SpellIcon;
