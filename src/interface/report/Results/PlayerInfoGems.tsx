import { ItemIcon } from 'interface';
import Icon from 'interface/Icon';
import ItemLink from 'interface/ItemLink';
import ITEMS from 'common/ITEMS';
import { Item as EventItem, Gem as EventGem } from 'parser/core/Events';
import { eventItemHasGemSocket } from 'common/ITEMS/thewarwithin/socketBonusId';
import { buildEventItemGems } from 'common/ITEMS/gemsUtils';

interface Props {
  gear: EventItem[];
}

/** Render a single gem icon. Prefers the icon string from the event gem (covers Classic/MoP
 * gems whose IDs aren't in the local ITEMS database), falling back to ItemIcon for retail. */
function GemIcon({ gem }: { gem: EventGem }) {
  // Negative IDs are pseudo-items (e.g. empty socket) — render inline, no link
  if (gem.id < 0) {
    const icon = gem.icon || (ITEMS[gem.id] ? ITEMS[gem.id].icon : 'equipment_empty_gem_socket');
    return <Icon icon={icon} className="gem" />;
  }

  // If the gem carries its own icon (from WCL event data), use it directly so
  // Classic gem IDs that aren't in the local ITEMS DB still render correctly.
  if (gem.icon) {
    return (
      <ItemLink id={gem.id} icon={false}>
        <Icon icon={gem.icon} className="gem" />
      </ItemLink>
    );
  }

  // Retail path: look up icon via local ITEMS database
  return <ItemIcon id={gem.id} className="gem" />;
}

const PlayerInfoGems = (props: Props) => {
  const { gear } = props;
  const itemsWithGems = gear.filter(
    (item) => item.id !== 0 && (item.gems?.length || eventItemHasGemSocket(item)),
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
            {gems.map((eventGem, index) => (
              <GemIcon gem={eventGem.gem} key={`${item.id}_${eventGem.gem.id}_${index}`} />
            ))}
          </div>
        );
      })}
    </>
  );
};

export default PlayerInfoGems;
