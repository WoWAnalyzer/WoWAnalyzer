import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';

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

    return (
      <div>
        <div style={{ padding: '0px 22px 15px 0px' }}>Please use the below table to populate the Player Log section of the Mistweaver Spreadsheet by Garg.                                                                                                                                    <a href="http://www.peakofserenity.com/mistweaver/spreadsheet/" target="_blank" rel="noopener noreferrer">Link to the sheet</a><br /></div>
        <div>
          <table style={styles.table}>
            <tr><td>Fight Length (Minutes)</td></tr>
            <tr><td>Fight Length (Seconds)</td></tr>
            <tr style={styles.cellBorder}><td>Mana Remaining</td></tr>
            <tr style={styles.cellBorder}><td>Absorbless DTPS</td></tr>
            <tr style={styles.cellBorder}><td>Thunder Focus Tea Casts</td></tr>
            <tr><td>Effuse</td></tr>
            <tr><td>Enveloping Mist</td></tr>
            <tr><td>Essence Font</td></tr>
            <tr><td>Renewing Mist</td></tr>
            <tr><td>Vivify</td></tr>
            <tr style={styles.cellBorder}><td>Mana Tea MP5</td></tr>
            <tr style={styles.cellBorder}><td>Lifecycles-EnM</td></tr>
            <tr><td>Lifecycles-Vivify</td></tr>
            <tr style={styles.cellBorder}><td>SotC Mana Return</td></tr>
            <tr style={styles.cellBorder}><td>Effective RJW %</td></tr>
            <tr style={styles.cellBorder}><td>Mastery per EF</td></tr>
            <tr style={styles.cellBorder}><td>Targets per Essence Font</td></tr>
            <tr><td>Targets per Chi Burst</td></tr>
          </table>
          {
          // This table is separate to allow for easier copy and pasting of the values from this page into the Mistweaver Spreadsheet.
        }
          <table style={styles.table}>
            <tr><td>{Math.floor(parser.fightDuration / 1000 / 60)}</td></tr>
            <tr><td>{Math.floor((parser.fightDuration / 1000) % 60)}</td></tr>
            <tr style={styles.cellBorder}><td>{parser._modules.manaValues.endingMana}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser._modules.damageTaken.total.regular / parser.fightDuration * 1000).toFixed(2)}</td></tr>
            <tr style={styles.cellBorder}><td>{parser._modules.thunderFocusTea.castsTft}</td></tr>
            <tr><td>{((parser._modules.thunderFocusTea.castsTftEff / parser._modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr><td>{((parser._modules.thunderFocusTea.castsTftEnm / parser._modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr><td>{((parser._modules.thunderFocusTea.castsTftEf / parser._modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr><td>{((parser._modules.thunderFocusTea.castsTftRem / parser._modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr><td>{((parser._modules.thunderFocusTea.castsTftViv / parser._modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser._modules.manaTea.manaSavedMT / parser.fightDuration * 1000 * 5).toFixed(0)}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser._modules.combatants.selected.hasTalent(SPELLS.LIFECYCLES_TALENT.id) && ((parser._modules.lifecycles.castsRedViv / (parser._modules.lifecycles.castsRedViv + parser._modules.lifecycles.castsNonRedViv)).toFixed(4))) || 0}</td></tr>
            <tr><td>{(parser._modules.combatants.selected.hasTalent(SPELLS.LIFECYCLES_TALENT.id) && ((parser._modules.lifecycles.castsRedEnm / (parser._modules.lifecycles.castsRedEnm + parser._modules.lifecycles.castsNonRedEnm)).toFixed(4))) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{parser._modules.spiritOfTheCrane.manaReturnSotc}</td></tr>
            <tr style={styles.cellBorder}><td>{((parser._modules.combatants.selected.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id) && ((parser._modules.refreshingJadeWind.healsRJW / parser._modules.refreshingJadeWind.castRJW) / 78)) || 0).toFixed(4)}</td></tr>
            <tr style={styles.cellBorder}><td>{(((parser._modules.essenceFontMastery.healEF / 2) / parser._modules.essenceFontMastery.castEF) || 0).toFixed(2)}</td></tr>
            <tr style={styles.cellBorder}><td>{((parser._modules.essenceFont.targetsEF / parser._modules.essenceFont.castEF) || 0).toFixed(2)}</td></tr>
            <tr><td>{((parser._modules.chiBurst.targetsChiBurst / parser._modules.chiBurst.castChiBurst) || 0).toFixed(2)}</td></tr>
          </table>
        </div>
      </div>
    );
  }
}

export default MonkSpreadsheet;
