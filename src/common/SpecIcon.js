import React from 'react';
import PropTypes from 'prop-types';

import SPECS from './SPECS';

const SpecIcon = ({ id, ...others }) => {
  if (!SPECS[id]) {
    throw new Error(`Unknown spec: ${id}`);
  }

  const { className, specName } = SPECS[id];

  return (
    <img
      src={`/specs/${className.replace(' ', '')}-${specName.replace(' ', '')}.jpg`}
      alt={`${specName} ${className}`}
      className="icon"
      {...others}
    />
  );
};
SpecIcon.propTypes = {
  id: PropTypes.number.isRequired,
};

export default SpecIcon;
