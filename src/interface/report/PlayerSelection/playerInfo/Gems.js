import React from 'react';
import PropTypes from 'prop-types';

import ItemIcon from 'common/ItemIcon';

class Gems extends React.PureComponent {
  static propTypes = {
    gear: PropTypes.array.isRequired,
  };

  render() {
    const { gear } = this.props;

    return (
      <>
        {
          gear.filter(item => item.id !== 0 && item.gems)
          .map(item => {
            const gearSlot = gear.indexOf(item);
            const gem = item.gems[0];
            return (
              <div key={`${gearSlot}_${gem.id}`} style={{ gridArea: `item-slot-${gearSlot}-gem` }}>
                <ItemIcon
                  id={gem.id}
                  className="gem"
                />
            </div>
            );
          })
        }
      </>
    );
  }
}

export default Gems;
