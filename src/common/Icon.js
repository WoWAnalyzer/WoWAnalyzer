import React from 'react';

const Icon = ({ icon, alt, ...other }) => (
  <img
    src={`http://media.blizzard.com/wow/icons/56/${icon.replace('.jpg', '')}.jpg`}
    alt={alt}
    {...other}
  />
);
Icon.propTypes = {
  icon: React.PropTypes.string.isRequired,
  alt: React.PropTypes.string.isRequired,
};

export default Icon;
