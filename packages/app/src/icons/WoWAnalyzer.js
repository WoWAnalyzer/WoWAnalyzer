import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ mainColor, arrowColor, ...other }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="icon" {...other}>
    <path
      d="M11.4842 102.243L1.02185 84.2455L49.9996 -7.62939e-06L98.9777 84.2461L88.5199 102.236L87.2159 99.9931H62.5V81.9943H76.7519L50.0041 35.986L23.2562 81.9943H37.5V99.9931H12.7923L11.4842 102.243ZM106.771 99.9931H106.809V99.9271L106.771 99.9931Z"
      fill={mainColor}
    />
    <path
      d="M12.7883 100H86L85.9971 99.9931H62.5V81.9943H76.7519L50.0041 35.986L23.2562 81.9943H37.5V99.9931H12.7923L12.7883 100Z"
      fill={arrowColor}
    />
  </svg>
);
Icon.propTypes = {
  mainColor: PropTypes.string,
  arrowColor: PropTypes.string,
};
Icon.defaultProps = {
  mainColor: '#FAB700',
  arrowColor: 'transparent',
};

export default Icon;
