import type { ComponentPropsWithoutRef } from 'react';

import Image from './images/WarcraftLogs-logo.png';

type Props = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt' | 'className'>;

const icon = (props: Props) => <img src={Image} alt="Warcraft Logs" className="icon" {...props} />;

export default icon;
