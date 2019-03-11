import React from 'react';
import PropTypes from 'prop-types';

import SPECS from 'game/SPECS';

const SpecIcon = ({ id, className, ...others }) => {
  if (!SPECS[id]) {
    throw new Error(`Unknown spec: ${id}`);
  }

  const spec = SPECS[id];

  return (
    <img
      src={`/specs/${spec.className.replace(' ', '')}-${spec.specName.replace(' ', '')}.jpg`}
      alt={`${spec.specName} ${spec.className}`}
      className={`icon ${className || ''}`}
      {...others}
    />
  );
};
SpecIcon.propTypes = {
  id: PropTypes.number.isRequired,
  className: PropTypes.string,
};

export default SpecIcon;
