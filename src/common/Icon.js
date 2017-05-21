import React from 'react';

const Icon = ({ icon, alt, ...other }) => {
  icon = icon.replace('.jpg', '').replace('-', '');
  if (icon === 'petbattle_healthdown') {
    // Blizzard seems to have forgotten to remove the dash for this one... or something
    icon = 'petbattle_health-down';
  }

  return (
    <img
      src={`http://media.blizzard.com/wow/icons/56/${icon}.jpg`}
      alt={alt}
      {...other}
    />
  );
};
Icon.propTypes = {
  icon: React.PropTypes.string.isRequired,
  alt: React.PropTypes.string.isRequired,
};

export default Icon;
