import React from 'react';
import SPELLS from './SPELLS';

const Spell = ({ id, children, category = undefined }) => (
  <a href={`http://www.wowhead.com/spell=${id}`} target="_blank" className={category}>
    {children || SPELLS[id].name}
  </a>
);
Spell.propTypes = {
  id: React.PropTypes.number.isRequired,
  children: React.PropTypes.node,
  category: React.PropTypes.string,
};

export default Spell;
