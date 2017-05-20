import React from 'react';

const Icon = ({ icon, alt, ...other }) => (
  <img
    src={`http://media.blizzard.com/wow/icons/56/${icon.replace('.jpg', '').replace('-', '')}.jpg`}
    alt={alt}
    {...other}
  />
);
Icon.propTypes = {
  id: React.PropTypes.number.isRequired,
  alt: React.PropTypes.string.isRequired,
};

export default Icon;
