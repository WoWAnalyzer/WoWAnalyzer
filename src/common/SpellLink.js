import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from './SPELLS';
import SpellIcon from './SpellIcon';

const SpellLink = ({ id, children, category = undefined, icon, iconStyle, ...other }) => {
  if (process.env.NODE_ENV === 'development' && !children && !SPELLS[id]) {
    throw new Error(`Unknown spell: ${id}`);
  }

  return (
    <a href={`http://www.wowhead.com/spell=${id}`} target="_blank" rel="noopener noreferrer" className={category} {...other}>
      {icon && <SpellIcon id={id} noLink style={{ height: '1.2em', marginTop: '-0.1em', ...iconStyle }} />}{' '}
      {children || SPELLS[id].name}
    </a>
  );
};
SpellLink.propTypes = {
  id: PropTypes.number.isRequired,
  children: PropTypes.node,
  category: PropTypes.string,
  icon: PropTypes.bool,
  iconStyle: PropTypes.object,
};
SpellLink.defaultProps = {
  icon: true,
};

export default SpellLink;
