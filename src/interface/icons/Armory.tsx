import { t } from '@lingui/macro';
import React from 'react';

import ArmoryLogo from './images/Armory-logo.png';

const Icon = (props: any) => (
  <img
    src={ArmoryLogo}
    alt={t({ id: 'interface.armory.alt', message: 'World of Warcraft Armory' })}
    className="icon"
    {...props}
  />
);

export default Icon;
