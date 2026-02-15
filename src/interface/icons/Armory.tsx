import { t } from '@lingui/macro';
import type { ComponentPropsWithoutRef } from 'react';

import ArmoryLogo from './images/Armory-logo.png';

type Props = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt' | 'className'>;

const Icon = (props: Props) => (
  <img
    src={ArmoryLogo}
    alt={t({ id: 'interface.armory.alt', message: 'World of Warcraft Armory' })}
    className="icon"
    {...props}
  />
);

export default Icon;
