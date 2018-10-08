import React from 'react';
import PropTypes from 'prop-types';
import SpellIcon from 'common/SpellIcon';

class HpmBreakdown extends React.Component {
  static propTypes = {
    tracker: PropTypes.object.isRequired,
    showSpenders: PropTypes.bool,
  };

  Table = () => {
    const { tracker } = this.props;

    const spellDetails = tracker.spellDetails;
    const spellRows = [];
    for (let spellId in spellDetails) {
      spellRows.push(this.SpellRow(spellDetails[spellId]));

    }
    return spellRows;
  };

  SpellRow = (spellDetail) => {
    return (
      <tr>
        <td>
          <SpellIcon id={spellDetail.spell.id} />
        </td>
        <th>Casts</th>
        <th>Hits</th>
        <th>Total Healing Done</th>
        <th>% Healing Done</th>
        <th>Total Damage Done</th>
        <th>% Damage Done</th>
        <th>Time Spent Casting</th>
        <th>% Time Spent Casting</th>
        <th>Mana Spent</th>
        <th>% Mana Spent</th>
        <th>Healing Per Mana Spent</th>
        <th>Damage Per Mana Spent</th>
      </tr>
    );
  };

  render() {
    const { tracker, showSpenders } = this.props;
    const resourceName = tracker.resource.name;

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ability</th>
              <th>Casts</th>
              <th>Hits</th>
              <th>Total Healing Done</th>
              <th>% Healing Done</th>
              <th>Total Damage Done</th>
              <th>% Damage Done</th>
              <th>Time Spent Casting</th>
              <th>% Time Spent Casting</th>
              <th>Mana Spent</th>
              <th>% Mana Spent</th>
              <th>Healing Per Mana Spent</th>
              <th>Damage Per Mana Spent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <this.Table />
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default HpmBreakdown;
