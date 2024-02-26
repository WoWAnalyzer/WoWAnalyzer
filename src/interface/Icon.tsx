import * as React from 'react';

import BAD_ICONS from './BAD_ICONS';

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

const Icon = ({ icon, className, alt = '', ...others }: IconProps) => {
  if (!icon) {
    return null;
  }
  icon = icon.replace('.jpg', '');

  let baseURL = `https://assets.rpglogs.com/img/warcraft/abilities`;
  if (BAD_ICONS.includes(icon)) {
    baseURL = `/img/Icons`;
  }

  return (
    <img
      src={`${baseURL}/${icon}.jpg`}
      alt={alt}
      className={`icon game ${className || ''}`}
      {...others}
    />
  );
};

export default Icon;
