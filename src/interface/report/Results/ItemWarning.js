import React from 'react';
import Warning from 'interface/Alert/Warning';
import PropTypes from 'prop-types';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';

const WARNING_ITEMS = [ITEMS.WHISPERING_ELDRITH_BOW.id];

class ItemWarning extends React.Component {
  static propTypes = {
    gear: PropTypes.array.isRequired,
  };

  badItems = [];
  checkItems() {
    const { gear } = this.props;
    if (gear) {
      Object.values(gear).forEach(item => {
        if (WARNING_ITEMS.includes(item.id) && !this.badItems.includes(item.id)) {
          this.badItems.push(item.id);
        }
      }, 0);
    }
  }

  render() {
    this.checkItems();
    if (this.badItems.length === 0) {
      return null;
    }
    return (
      <div className="container">
        <Warning style={{ marginBottom: 30 }}>
          This module can have some inaccuracies caused by effects from items that cannot be tracked in WoWAnalyzer, this may cause not all statistics to be accurate for this player. This is due to the following items: <br />
          {this.badItems.map(item => (
            <ItemLink key={item} id={item} />
          ))}
        </Warning>
      </div>);
  }

}

export default ItemWarning;
