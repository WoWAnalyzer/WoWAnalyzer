import React from 'react';

import { Item } from 'parser/core/Events';

import enchantIdMap from './enchantIdMap';

interface Props {
  gear: Item[];
}

const PlayerInfoEnchants = (props: Props) => {
  const { gear } = props;
  return (
    <>
      {
        gear.filter(item => item.id !== 0 && item.permanentEnchant)
        .map(item => {
          const gearSlot = gear.indexOf(item);

          return (
            <div key={`${gearSlot}_${item.permanentEnchant}`} className={`item-slot-${gearSlot}-enchant`} style={{ gridArea: `item-slot-${gearSlot}-enchant` }}>
              {item?.permanentEnchant && <span className="enchant-info">{enchantIdMap[item.permanentEnchant]}</span>}
            </div>
          );
        })}
    </>
  );
};

export default PlayerInfoEnchants;
