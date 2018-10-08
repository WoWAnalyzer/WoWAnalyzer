import React from 'react';
import PropTypes from 'prop-types';
import SpellIcon from 'common/SpellIcon';

const Table = (props) => {
  const { tracker } = props;
  const spellDetails = tracker.spellDetails;
  const spellRows = [];
  for (let spellId in spellDetails) {
    if (spellDetails[spellId].casts > 0) {
      spellRows.push(SpellRow(spellDetails[spellId]));
    }
  }
  return spellRows;
};

const SpellRow = (spellDetail) => {
  console.log(spellDetail);
  return (
    <tr>
      <td>
        <SpellIcon id={spellDetail.spell.id} />
      </td>
      <td>{spellDetail.casts}</td>
      <td>{spellDetail.healingHits}</td>
      <td>{spellDetail.healingDone}</td>
      <td>% Healing Done</td>
      <td>{spellDetail.damageHits}</td>
      <td>{spellDetail.damageDone}</td>
      <td>% Damage Done</td>
      <td>Time Spent Casting</td>
      <td>% Time Spent Casting</td>
      <td>{spellDetail.manaSpent}</td>
      <td>% Mana Spent</td>
      <td>Healing Per Mana Spent</td>
      <td>Damage Per Mana Spent</td>
    </tr>
  );
};

class HpmBreakdown extends React.Component {
  static propTypes = {
    tracker: PropTypes.object.isRequired,
    showSpenders: PropTypes.bool,
  };

  render() {
    const { tracker, showSpenders } = this.props;

    return (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ability</th>
              <th>Casts</th>
              <th>Healing Hits</th>
              <th>Total Healing Done</th>
              <th>% Healing Done</th>
              <th>Damage Hits</th>
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
            <Table tracker={tracker} />
          </tbody>
        </table>
      </div>
    );
  }
}

export default HpmBreakdown;
