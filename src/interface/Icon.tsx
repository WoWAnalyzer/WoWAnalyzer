import type { HTMLAttributes, ComponentPropsWithoutRef } from 'react';

import BAD_ICONS, { ICON_RENAME } from './BAD_ICONS';

export interface IconProps extends HTMLAttributes<HTMLImageElement> {
  icon?: string;
  className?: string;
  /**
   * Implementers should annotate these as desired, but it's usually just
   * decorating the name of a spell/item so doesn't add anything and in fact
   * makes copy-pasting uglier
   */
  alt?: string;
}

export type SvgIconProps = Omit<
  ComponentPropsWithoutRef<'svg'>,
  'xmlns' | 'version' | 'viewBox' | 'className'
>;

const ICON_FOLDER_NAMES = ['NPC'];

export function iconUrl(icon: string): string {
  let [folder, name] = icon.split('/');
  if (name === undefined) {
    [folder, name] = ['abilities', folder];
  }

  icon = name.replace('.jpg', '').replace(/^custom-icon-/, '');

  if (ICON_FOLDER_NAMES.includes(icon)) {
    folder = 'icons';
  }

  if (ICON_RENAME[icon]) {
    icon = ICON_RENAME[icon];
  }

  let baseURL = `https://assets.rpglogs.com/img/warcraft/${folder}`;
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
