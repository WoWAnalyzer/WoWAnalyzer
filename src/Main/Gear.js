import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'common/Icon';
import ItemLink from 'common/ItemLink';
import ITEM_QUALITIES from 'common/ITEM_QUALITIES';

class Gear extends React.PureComponent {
  static propTypes = {
    selectedCombatant: PropTypes.object.isRequired,
  };
  render() {
    const gear = Object.values(this.props.selectedCombatant._gearItemsBySlotId);

    const artifact = gear.find(item => item.quality === 6);
    const relics = artifact ? artifact.gems : [];

    return (
      <div>
        <div style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block', width: '90%' }}>
          {[...gear, ...relics]
            .filter(item => item.id !== 0)
            .map(item => (
              <div key={item.id} style={{ display: 'inline-block', textAlign: 'center' }}>
                {item.itemLevel}
                <ItemLink
                  id={item.id}
                  quality={item.quality || ITEM_QUALITIES.EPIC}// relics don't have a quality, but they're always epic
                  details={item}
                  style={{ margin: '5px', display: 'block', fontSize: '46px', lineHeight: 1 }}
                >
                  <Icon icon={item.icon} style={{ border: '3px solid currentColor' }} />
                </ItemLink>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default Gear;
