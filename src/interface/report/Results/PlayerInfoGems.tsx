import { ItemIcon } from 'interface';
import { Item, Gem as EventGem } from 'parser/core/Events';
import GemChecker from 'parser/shared/modules/items/GemChecker'
import {
  eventItemGemSocketCount,
} from 'common/ITEMS/thewarwithin/socketBonusId';

interface Props {
  gear: Item[];
}

const PlayerInfoGems = (props: Props) => {
  const { gear } = props;
  const itemsWithGems = gear.filter((item) => item.id !== 0 && item.gems);
  return (
    <>
      {itemsWithGems.map((item) => {
        if (!item.gems) {
          return null;
        }
        const gearSlot = gear.indexOf(item);
        const options = { owner: 'defaultOwner', priority: 0 }; // Replace with actual values as needed
        


        const gems: { gem: EventGem }[] = buildGemPlaceholders(item, gearSlot);
        return (
          gems.map((eventGem, index) => {
            return (
              <div key={`${gearSlot}_${eventGem.gem.id}_${index}`} style={{ gridArea: `item-slot-${gearSlot}-gem` }}>
                <ItemIcon id={eventGem.gem.id} className="gem" />
              </div>
            );
          })
        );
      })}
    </>
  );
};

export default PlayerInfoGems;

function buildGemPlaceholders(item: Item, slotNumber: number): { gem: EventGem }[] {

    const actualSocketCount: number = eventItemGemSocketCount(item);
    
    const result: { gem: EventGem }[] = [];
    let i: number = item.gems?.length ?? 0;

    for (; i < actualSocketCount; i += 1) {
      result.push({
        gem: {
          id: 0,
          icon: 'equipment_empty_gem_socket',
          itemLevel: -1,
        },
      });
    }

    return result;
  }