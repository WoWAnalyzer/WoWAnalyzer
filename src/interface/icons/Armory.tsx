import * as React from 'react';

import ArmoryLogo from './images/Armory-logo.png';

type Props = Omit<React.ComponentPropsWithoutRef<'img'>, 'src' | 'alt' | 'className'>;

const Icon = (props: Props) => (
  <img src={ArmoryLogo} alt="World of Warcraft Armory" className="icon" {...props} />
);

export default Icon;
