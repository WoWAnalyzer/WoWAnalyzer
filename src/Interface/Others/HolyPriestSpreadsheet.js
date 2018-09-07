import React from 'react';
import PropTypes from 'prop-types';

class MonkSpreadsheet extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
  };

  render() {
    const { parser } = this.props;

    const styles = {
      cellBorder: { borderTop: '.5px solid #dddddd' },
      table: { borderBottom: '1px solid #dddddd', borderTop: '1px solid #dddddd', align: 'left', padding: '8px', float: 'left', margin: '2px' },
    };

    const getAbility = spellId => parser._modules.abilityTracker.getAbility(spellId);

    const overhealingSpell = spellId => ((getAbility(spellId).healingOverheal || 0) / ((getAbility(spellId).healingOverheal || 0) + (getAbility(spellId).healingEffective || 0)) || 0).toFixed(4);

    const cpm = spellId => (getAbility(spellId).casts / Math.floor(parser.fightDuration / 1000 / 60) || 0).toFixed(2);

    return (

      <div>
        <div style={{ padding: '0px 22px 15px 0px' }}>Please use the below table to populate the Player Log section of the Holy Priest Spreadsheet by Niphyr. <a href="http://www.peakofserenity.com/mistweaver/spreadsheet/" target="_blank" rel="noopener noreferrer">Link to the sheet</a><br /></div>
        <div>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td>Intellect Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.intellect}</td>
              </tr>
              <tr>
                <td>Critical Strike Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.critSpell}</td>
              </tr>
              <tr>
                <td>Haste Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.hasteSpell}</td>
              </tr>
              <tr>
                <td>Mastery Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.mastery}</td>
              </tr>
              <tr>
                <td>Versatility Rating</td>
                <td>{parser.selectedCombatant._combatantInfo.versatilityHealingDone}</td>
              </tr>
            </tbody>
          </table>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td>Spell Name</td>
                <td>Overheal %</td>
                <td>CPM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default MonkSpreadsheet;
