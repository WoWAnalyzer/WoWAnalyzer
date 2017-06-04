import React from 'react';
import PropTypes from 'prop-types';
import SPELLS from './SPELLS';

const SpellLink = ({ id, children, category = undefined, ...other }) => {
  if (process.env.NODE_ENV === 'development' && !children && !SPELLS[id]) {
    throw new Error(`Unknown spell: ${id}`);
  }

  return (
    <a href={`http://www.wowhead.com/spell=${id}`} target="_blank" className={category} {...other}>
      {children || SPELLS[id].name}
    </a>
  );
};
SpellLink.propTypes = {
  id: PropTypes.number.isRequired,
  children: PropTypes.node,
  category: PropTypes.string,
};

export default SpellLink;
