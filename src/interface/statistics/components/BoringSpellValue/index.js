import React from 'react';
import PropTypes from 'prop-types';

import SpellIcon from '../../../../common/SpellIcon';

import './BoringSpellValue.scss';

const BoringSpellValue = ({ spell, value, label }) => (
  <div className="flex boring-spell-value">
    <div className="flex-sub icon">
      <SpellIcon id={spell.id} />
    </div>
    <div className="flex-main value">
      <div>{value}</div>
      <small>{label}</small>
    </div>
  </div>
);
BoringSpellValue.propTypes = {
  spell: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  value: PropTypes.node.isRequired,
  label: PropTypes.node.isRequired,
};

export default BoringSpellValue;
