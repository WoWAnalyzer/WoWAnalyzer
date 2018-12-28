import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from 'common/SpellIcon';

import './SpellValue.scss';

const SpellValue = ({ spell, value, label }) => (
  <div className="flex spell-value">
    <div className="flex-sub icon">
      <SpellIcon id={spell.id} />
    </div>
    <div className="flex-main value">
      <div>{value}</div>
      <small>{label}</small>
    </div>
  </div>
);
SpellValue.propTypes = {
  spell: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  value: PropTypes.node.isRequired,
  label: PropTypes.node.isRequired,
};

export default SpellValue;
