import { ItemLink } from 'interface';
import AlertWarning from 'interface/AlertWarning';
import { Item } from 'parser/core/Events';
import { Component } from 'react';

const WARNING_ITEMS: number[] = [];

interface Props {
  gear: Item[];
}

class ItemWarning extends Component<Props> {
  badItems: number[] = [];
  checkItems() {
    this.props.gear.forEach((item) => {
      if (WARNING_ITEMS.includes(item.id) && !this.badItems.includes(item.id)) {
        this.badItems.push(item.id);
      }
    }, 0);
  }

  render() {
    this.checkItems();
    if (this.badItems.length === 0) {
      return null;
    }
    return (
      <div className="container">
        <AlertWarning style={{ marginBottom: 30 }}>
          This module can have some inaccuracies caused by effects from items that cannot be tracked
          in WoWAnalyzer, this may cause not all statistics to be accurate for this player. This is
          due to the following items: <br />
          {this.badItems.map((item) => (
            <ItemLink key={item} id={item} />
          ))}
        </AlertWarning>
      </div>
    );
  }
}

export default ItemWarning;
