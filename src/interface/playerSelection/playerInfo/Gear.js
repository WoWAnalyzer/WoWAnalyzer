import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import ItemLink from 'common/ItemLink';
import ITEM_QUALITIES from 'game/ITEM_QUALITIES';


class Gear extends React.PureComponent {
  static propTypes = {
    gear: PropTypes.array.isRequired,
  };

  render() {
    const { gear } = this.props;

    return (
      <>
        {
          gear.filter(item => item.id !== 0)
          .map(item => {
            // Items seem to turn epic from 340 item level, but WCL doesn't show this properly
            let quality = item.itemLevel >= 340 ? ITEM_QUALITIES.EPIC : item.quality;
            if (!quality) {
              quality = ITEM_QUALITIES.EPIC; // relics don't have a quality, but they're always epic
            }

            const gearSlot = gear.indexOf(item);

            return (
              <div key={`${gearSlot}_${item.id}`} style={{ display: 'inline-block', textAlign: 'center', gridArea: `item-slot-${gearSlot}` }} className={`item-slot-${gearSlot}`}>
                <ItemLink
                  id={item.id}
                  quality={quality}
                  details={item}
                  style={{ display: 'block', fontSize: '46px', lineHeight: 1 }}
                  icon={false}
                >
                  <Icon className="gear-icon icon" icon={item.icon} />
                  <div className="gear-ilvl">{item.itemLevel}</div>
                </ItemLink>
              </div>
            );
          })
        }
      </>
    );
  }
}

export default Gear;
