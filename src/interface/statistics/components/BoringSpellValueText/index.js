/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the very last resort.
 */
import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

const BoringSpellValueText = ({ spell, children, className }) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <SpellIcon id={spell.id} /> <SpellLink id={spell.id} icon={false} />
    </label>
    <div className="value">
      {children}
    </div>
  </div>
);
BoringSpellValueText.propTypes = {
  spell: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default BoringSpellValueText;
