import * as React from 'react';

import BAD_ICONS, { ICON_RENAME } from './BAD_ICONS';

export interface IconProps extends React.HTMLAttributes<HTMLImageElement> {
  icon?: string;
  className?: string;
  /**
   * Implementers should annotate these as desired, but it's usually just
   * decorating the name of a spell/item so doesn't add anything and in fact
   * makes copy-pasting uglier
   */
  alt?: string;
}

export function iconUrl(icon: string): string {
  icon = icon.replace('.jpg', '');

  if (ICON_RENAME[icon]) {
    icon = ICON_RENAME[icon];
  }

  let baseURL = `https://assets.rpglogs.com/img/warcraft/abilities`;
  if (BAD_ICONS.includes(icon)) {
    baseURL = `/img/Icons`;
  }

  return `${baseURL}/${icon}.jpg`;
}

const Icon = ({ icon, className, alt = '', ...others }: IconProps) => {
  if (!icon) {
    return null;
  }

  return (
    <img src={iconUrl(icon)} alt={alt} className={`icon game ${className || ''}`} {...others} />
  );
};

export default Icon;
