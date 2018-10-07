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
    const gear = this.props.gear;

    const artifact = gear.find(item => item.quality === 6);
    const relics = artifact && artifact.gems ? artifact.gems : [];

    return (
      <>
        <div className="row">
          <div className="col-md-12">
            <h2>
              Equipped Gear
            </h2>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 hpadding-lg-30">{/* some bonus padding so it looks to be aligned with the icon for stats */}
            {[...gear, ...relics]
              .filter(item => item.id !== 0)
              .map(item => {
                // Items seem to turn epic from 340 item level, but WCL doesn't show this properly
                let quality = item.itemLevel >= 340 ? ITEM_QUALITIES.EPIC : item.quality;
                if (!quality) {
                  quality = ITEM_QUALITIES.EPIC; // relics don't have a quality, but they're always epic
                }

                return (
                  <div key={item.id} style={{ display: 'inline-block', textAlign: 'center' }}>
                    {item.itemLevel}
                    <ItemLink
                      id={item.id}
                      quality={quality}
                      details={item}
                      style={{ margin: '5px', display: 'block', fontSize: '46px', lineHeight: 1 }}
                      icon={false}
                    >
                      <Icon icon={item.icon} style={{ border: '3px solid currentColor' }} />
                    </ItemLink>
                  </div>
                );
              })}
          </div>
        </div>
      </>
    );
  }
}

export default Gear;
