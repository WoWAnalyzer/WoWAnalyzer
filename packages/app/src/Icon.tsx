import React from 'react';

import BAD_ICONS from './BAD_ICONS';

interface Props extends React.HTMLAttributes<HTMLImageElement> {
  icon?: string
  className?: string
  /**
   * Implementers should annotate these as desired, but it's usually just
   * decorating the name of a spell/item so doesn't add anything and in fact
   * makes copy-pasting uglier
   */
  alt?: string
}

const Icon = ({ icon, className, alt = '', ...others }: Props) => {
  if (!icon) {
    return null;
  }
  icon = icon.replace('.jpg', '').replace(/-/g, '');
  if (icon === 'petbattle_healthdown') {
    // Blizzard seems to have forgotten to remove the dash for this one... or something
    icon = 'petbattle_health-down';
  }
  if (icon === 'class_demonhunter') {
    // Blizzard seems to have forgotten to remove the dash for this one too
    icon = 'class_demon-hunter';
  }

  let baseURL = `//render-us.worldofwarcraft.com/icons/56`;
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
