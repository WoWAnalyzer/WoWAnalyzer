import React from 'react';
import PropTypes from 'prop-types';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

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
  return (
    <tr key={spellDetail.spell.id}>
      <td>
        <SpellIcon id={spellDetail.spell.id} />
      </td>
      <td>{spellDetail.casts}</td>
      <td>{spellDetail.healingHits}</td>
      <td>{spellDetail.healingDone}</td>
      <td>{formatPercentage(spellDetail.percentHealingDone)}</td>
      <td>{spellDetail.damageHits}</td>
      <td>{spellDetail.damageDone}</td>
      <td>{formatPercentage(spellDetail.percentDamageDone)}</td>
      <td>{spellDetail.manaSpent}</td>
      <td>{formatPercentage(spellDetail.manaPercentSpent)}</td>
      <th>{formatNumber(spellDetail.hpm)}</th>
      <th>{formatNumber(spellDetail.dpm)}</th>
      <th>{Math.floor(spellDetail.timeSpentCasting / 1000)}s</th>
      <th>{formatNumber(spellDetail.percentTimeSpentCasting)}</th>
      <th>Healing Per Time Spent Casting</th>
      <th>Damage Per Time Spent Casting</th>
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
              <th>Mana Spent</th>
              <th>% Mana Spent</th>
              <th>Healing Per Mana Spent</th>
              <th>Damage Per Mana Spent</th>
              <th>Time Spent Casting</th>
              <th>% Time Spent Casting</th>
              <th>Healing Per Time Spent Casting</th>
              <th>Damage Per Time Spent Casting</th>
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
