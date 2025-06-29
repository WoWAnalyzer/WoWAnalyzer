import getItemQualityLabel from 'common/getItemQualityLabel';
import { ITEM_QUALITIES } from 'game/ITEM_QUALITIES';
import Icon from 'interface/Icon';
import ItemLink from 'interface/ItemLink';
import { Item } from 'parser/core/Events';

interface Props {
  gear: Item[];
}

const PlayerInfoGear = (props: Props) => {
  const { gear } = props;

  return (
    <>
      {gear
        .filter((item) => item.id !== 0)
        .map((item) => {
          let quality = item.quality;
          if (!quality) {
            quality = ITEM_QUALITIES.EPIC; // relics don't have a quality, but they're always epic
          }

          if (quality < item.quality) {
            quality = item.quality;
          }

          const qualityClass = getItemQualityLabel(quality);
          const gearSlot = gear.indexOf(item);

          return (
            <div
              key={`${gearSlot}_${item.id}`}
              style={{
                display: 'inline-block',
                textAlign: 'center',
                gridArea: `item-slot-${gearSlot}`,
              }}
              className={`item-slot-${gearSlot}`}
            >
              <ItemLink id={item.id} quality={quality} details={item} icon={false}>
                <Icon className={`gear-icon icon ${qualityClass}`} icon={item.icon} />
                <div className="gear-ilvl">{item.itemLevel}</div>
              </ItemLink>
            </div>
          );
        })}
    </>
  );
};

export default PlayerInfoGear;
