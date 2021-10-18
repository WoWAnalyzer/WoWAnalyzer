import { t } from '@lingui/macro';
import React from 'react';

import Image from './images/Wipefest-logo.png';

type Props = Omit<React.ComponentPropsWithoutRef<'img'>, 'src' | 'alt' | 'className'>;

const icon = (props: Props) => (
  <img
    src={Image}
    alt={t({ id: 'interface.wipefest', message: 'Wipefest' })}
    className="icon"
    {...props}
  />
);

export default icon;
