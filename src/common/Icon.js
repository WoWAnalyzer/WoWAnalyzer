import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ icon, alt, ...other }) => {
  icon = icon.replace('.jpg', '').replace('-', '');
  if (icon === 'petbattle_healthdown') {
    // Blizzard seems to have forgotten to remove the dash for this one... or something
    icon = 'petbattle_health-down';
  }
  if (icon === 'class_demonhunter') {
    // Blizzard seems to have forgotten to remove the dash for this one too
    icon = 'class_demon-hunter';
  }

  return (
    <img
      src={`//render-us.worldofwarcraft.com/icons/56/${icon}.jpg`}
      alt={alt || icon}
      className="icon"
      {...other}
    />
  );
};
Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  alt: PropTypes.string,
};

export default Icon;
