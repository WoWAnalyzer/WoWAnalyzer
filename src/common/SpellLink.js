import React from 'react';
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
  id: React.PropTypes.number.isRequired,
  children: React.PropTypes.node,
  category: React.PropTypes.string,
};

export default SpellLink;
