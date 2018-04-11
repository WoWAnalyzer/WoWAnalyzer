import React from 'react';
import PropTypes from 'prop-types';

import BAD_ICONS from 'common/BAD_ICONS';

const Icon = ({ icon, alt, ...others }) => {
  if (!icon) {
    return null;
  }
  icon = icon.replace('.jpg', '').replace('-', '');
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
      alt={alt || icon}
      className="icon"
      {...others}
    />
  );
};
Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

export default Icon;
