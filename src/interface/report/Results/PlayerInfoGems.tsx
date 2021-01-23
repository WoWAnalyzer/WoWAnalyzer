import React from 'react';

import { ItemIcon } from 'interface';
import { Item } from 'parser/core/Events';

interface Props {
  gear: Item[];
}

const PlayerInfoGems = (props: Props) => {
  const { gear } = props;
  const itemsWithGems = gear.filter((item) => item.id !== 0 && item.gems);
  return (
    <>
      {itemsWithGems.map((item) => {
        if(!item.gems) { return null }
        const gearSlot = gear.indexOf(item);
        const gem = item.gems[0];
        return (
          <div key={`${gearSlot}_${gem?.id}`} style={{ gridArea: `item-slot-${gearSlot}-gem` }}>
            <ItemIcon id={gem?.id} className="gem" />
          </div>
        );
      })}
    </>
  );
};

export default PlayerInfoGems;
