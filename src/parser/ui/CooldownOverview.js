import React from 'react';
import PropTypes from 'prop-types';

import Cooldown from './Cooldown';

const CooldownOverview = ({ fightStart, fightEnd, cooldowns, applyTimeFilter }) => (
  <ul className="list">
    {cooldowns.map(cooldown => (
      <li key={`${cooldown.spell.id}-${cooldown.start}`} className="item clearfix" style={{ padding: '10px 30px' }}>
        <Cooldown cooldown={cooldown} fightStart={fightStart} fightEnd={fightEnd} applyTimeFilter={applyTimeFilter} />
      </li>
    ))}
  </ul>
);
CooldownOverview.propTypes = {
  fightStart: PropTypes.number.isRequired,
  fightEnd: PropTypes.number.isRequired,
  cooldowns: PropTypes.arrayOf(PropTypes.shape({
    ability: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }),
    start: PropTypes.number.isRequired,
    end: PropTypes.number,
    events: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
  applyTimeFilter: PropTypes.func,
};

export default CooldownOverview;
