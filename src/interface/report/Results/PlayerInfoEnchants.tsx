import { Item } from 'parser/core/Events';

import enchantIdMap from './enchantIdMap';

interface Props {
  gear: Item[];
}

const PlayerInfoEnchants = (props: Props) => {
  const { gear } = props;
  return (
    <>
      {gear
        .filter(
          (item) =>
            item.id !== 0 && (item.permanentEnchant || item.temporaryEnchant || item.onUseEnchant),
        )
        .map((item) => {
          const gearSlot = gear.indexOf(item);

          return (
            <div
              key={`${gearSlot}_${item.permanentEnchant}_${item.onUseEnchant}`}
              className={`item-slot-${gearSlot}-enchant`}
              style={{ gridArea: `item-slot-${gearSlot}-enchant` }}
            >
              {item.permanentEnchant && (
                <span className="enchant-info">{enchantIdMap[item.permanentEnchant]}</span>
              )}
              {item.temporaryEnchant && enchantIdMap[item.temporaryEnchant] && (
                <span className="enchant-info">{enchantIdMap[item.temporaryEnchant]}</span>
              )}
              {item.onUseEnchant && enchantIdMap[item.onUseEnchant] && (
                <span className="enchant-info">{enchantIdMap[item.onUseEnchant]}</span>
              )}
            </div>
          );
        })}
    </>
  );
};

export default PlayerInfoEnchants;
