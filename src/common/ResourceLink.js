import React from 'react';
import PropTypes from 'prop-types';

import RESOURCE_TYPES from './RESOURCE_TYPES';
import ResourceIcon from './ResourceIcon';

const ResourceLink = ({ id, children, category = undefined, icon, ...other }) => {
  if (process.env.NODE_ENV === 'development' && !children && !RESOURCE_TYPES[id]) {
    throw new Error(`Unknown spell: ${id}`);
  }

  return (
    <a href={`http://www.wowhead.com/${RESOURCE_TYPES[id].url}`} target="_blank" rel="noopener noreferrer" className={category} {...other}>
      {icon && <ResourceIcon id={id} noLink style={{ height: '1.2em', marginTop: '-0.1em' }} />}{' '}
      {children || RESOURCE_TYPES[id].name}
    </a>
  );
};
ResourceLink.propTypes = {
  id: PropTypes.number.isRequired,
  children: PropTypes.node,
  category: PropTypes.string,
  icon: PropTypes.bool,
};
ResourceLink.defaultProps = {
  icon: false,
};

export default ResourceLink;
