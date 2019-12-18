import React from 'react';
import PropTypes from 'prop-types';

import enchantIdMap from 'common/enchantIdMap';

const Enchants = props => {
  const { gear } = props;

  return (
    <>
      {
        gear.filter(item => item.id !== 0 && item.permanentEnchant)
        .map(item => {
          const gearSlot = gear.indexOf(item);

          return (
            <div key={`${gearSlot}_${item.permanentEnchant}`} className={`item-slot-${gearSlot}-enchant`} style={{ gridArea: `item-slot-${gearSlot}-enchant` }}>
              <span className="enchant-info">{enchantIdMap[item.permanentEnchant]}</span>
            </div>
          );
        })}
    </>
  );
};

Enchants.propTypes = {
  gear: PropTypes.array.isRequired,
};

export default Enchants;
