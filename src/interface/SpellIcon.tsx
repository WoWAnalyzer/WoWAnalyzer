import type { ComponentProps } from 'react';

import Icon from './Icon';
import SpellLink from './SpellLink';
import useSpellInfo from './useSpellInfo';
import Spell from 'common/SPELLS/Spell';
import { SPELL_ICON_OVERRIDES } from './BAD_ICONS';

interface Props extends Omit<ComponentProps<typeof Icon>, 'id' | 'icon'> {
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

  const spellId = typeof spell === 'number' ? spell : spell.id;

  const iconName = SPELL_ICON_OVERRIDES[spellId] ?? spellWithFallback.icon;

  const icon = <Icon icon={iconName} alt={alt !== '' ? spellWithFallback.name : ''} {...others} />;

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
