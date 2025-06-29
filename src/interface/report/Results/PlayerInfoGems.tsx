import { ItemIcon } from 'interface';
import { Item as EventItem, Gem as EventGem } from 'parser/core/Events';
import { eventItemHasGemSocket } from 'common/ITEMS/thewarwithin/socketBonusId';
import { buildEventItemGems } from 'common/ITEMS/gemsUtils';

interface Props {
  gear: EventItem[];
}

const PlayerInfoGems = (props: Props) => {
  const { gear } = props;
  const itemsWithGems = gear.filter(
    (item) => item.id !== 0 && (item.gems || eventItemHasGemSocket(item)),
  );
  return (
    <>
      {itemsWithGems.map((item) => {
        const gems: { gem: EventGem }[] = buildEventItemGems(item);
        const gearSlot = gear.indexOf(item);

        // Define gear slots that should use `row-reverse`
        const reverseSlots = [5, 6, 7, 9, 10, 11, 12, 13, 15];
        const rowDirection = reverseSlots.includes(gearSlot) ? 'row-reverse' : 'row';

        return (
          <div
            key={`item_${item.id}_${gearSlot}`}
            style={{
              gridArea: `item-slot-${gearSlot}-gem`,
              display: 'flex',
              flexDirection: rowDirection,
            }}
          >
            {gems.map((eventGem, index) => {
              return (
                <ItemIcon
                  id={eventGem.gem.id}
                  className="gem"
                  key={`${item.id}_${eventGem.gem.id}_${index}`}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export default PlayerInfoGems;
