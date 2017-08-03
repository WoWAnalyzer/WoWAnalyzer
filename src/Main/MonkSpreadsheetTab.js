import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

import SPELLS from 'common/SPELLS';

class MonkSpreadsheet extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
    };
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  render() {
    const { parser } = this.props;

    const abilityTracker = parser.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);
    const SGability = getAbility(SPELLS.SHEILUNS_GIFT.id);
    const SGcasts = SGability.casts || 0;

    const styles = {
      cellBorder: { borderTop: '.5px solid #dddddd' },
      table:  {borderBottom: '1px solid #dddddd', borderTop: '1px solid #dddddd', align: 'left', padding: '8px', float: 'left', margin: '2px' },
    };

    console.log('Log Tab: ', parser);
    return (
      <div>
        <div className="panel-heading">
          <h2>Player Log Data</h2>
        </div>
        <div style={{ padding: '15px 22px 15px 15px' }}>
          <div style={{ padding: '0px 22px 15px 0px' }}>Please use the below table to populate the Player Log section of the Mistweaver Spreadsheet by Garg.  <a href="http://www.peakofserenity.com/mistweaver/spreadsheet/" target="_blank" rel="noopener noreferrer">Link to the sheet</a><br /></div>
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
            <tr style={styles.cellBorder}><td>Total Uplifting Trance procs</td></tr>
            <tr><td>Unused UT %</td></tr>
            <tr style={styles.cellBorder}><td>Mana Tea MP5</td></tr>
            <tr style={styles.cellBorder}><td>Lifecycles-EnM</td></tr>
            <tr><td>Lifecycles-Vivify</td></tr>
            <tr style={styles.cellBorder}><td>SotC Mana Return</td></tr>
            <tr style={styles.cellBorder}><td>Average SG Stacks</td></tr>
            <tr style={styles.cellBorder}><td>Effective WoS %</td></tr>
            <tr style={styles.cellBorder}><td>Targets per Celestial Breath</td></tr>
            <tr style={styles.cellBorder}><td>The Mists of Sheilun Procs</td></tr>
            <tr><td>Targets per TMoS</td></tr>
            <tr style={styles.cellBorder}><td>Effective RJW %</td></tr>
            <tr style={styles.cellBorder}><td>Dancing Mist Healing</td></tr>
            <tr style={styles.cellBorder}><td>Mastery per EF</td></tr>
            <tr style={styles.cellBorder}><td>Targets per Essence Font</td></tr>
            <tr><td>Targets per Chi Burst</td></tr>
            <tr style={styles.cellBorder}><td>Misc MP5</td></tr>
            <tr><td>Misc HPS</td></tr>
            <tr style={styles.cellBorder}><td>Tier 20 2 Piece MP5</td></tr>
            <tr style={styles.cellBorder}><td>Tier 20 4 Piece Uptime</td></tr>
          </table>
          <table style={styles.table}>
            <tr><td>{Math.floor(parser.fightDuration / 1000 / 60)}</td></tr>
            <tr><td>{Math.floor((parser.fightDuration / 1000) % 60)}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.manaValues.endingMana}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.damageTaken / parser.fightDuration * 1000).toFixed(2)}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.thunderFocusTea.castsTft}</td></tr>
            <tr><td>{parser.modules.thunderFocusTea.castsTftEff / parser.modules.thunderFocusTea.castsTft}</td></tr>
            <tr><td>{parser.modules.thunderFocusTea.castsTftEnm / parser.modules.thunderFocusTea.castsTft}</td></tr>
            <tr><td>{parser.modules.thunderFocusTea.castsTftEf / parser.modules.thunderFocusTea.castsTft}</td></tr>
            <tr><td>{parser.modules.thunderFocusTea.castsTftRem / parser.modules.thunderFocusTea.castsTft}</td></tr>
            <tr><td>{parser.modules.thunderFocusTea.castsTftViv / parser.modules.thunderFocusTea.castsTft}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.upliftingTrance.UTProcsTotal}</td></tr>
            <tr><td>{(1 - (parser.modules.upliftingTrance.consumedUTProc / parser.modules.upliftingTrance.UTProcsTotal)).toFixed(4)}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.manaTea.manaSavedMT / parser.fightDuration * 1000 * 5).toFixed(0)}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.selectedCombatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id) && ((parser.modules.manaSavingTalents.castsRedViv / (parser.modules.manaSavingTalents.castsRedViv + parser.modules.manaSavingTalents.castsNonRedViv)).toFixed(4))) || 0}</td></tr>
            <tr><td>{(parser.selectedCombatant.hasTalent(SPELLS.LIFECYCLES_TALENT.id) && ((parser.modules.manaSavingTalents.castsRedEnm / (parser.modules.manaSavingTalents.castsRedEnm + parser.modules.manaSavingTalents.castsNonRedEnm)).toFixed(4))) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.manaSavingTalents.manaReturnSotc}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.sheilunsGift.stacksTotalSG / SGcasts || 0).toFixed(0)}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.sheilunsGift.countWhispersHeal / ((Math.floor(parser.fightDuration / 10000) + parser.modules.sheilunsGift.countEff))).toFixed(4) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{((parser.modules.aoeHealingTracker.healsCelestialBreath / parser.modules.aoeHealingTracker.procsCelestialBreath) / 3).toFixed(2) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.aoeHealingTracker.procsMistsOfSheilun}</td></tr>
            <tr><td>{(parser.modules.aoeHealingTracker.healsMistsOfSheilun / parser.modules.aoeHealingTracker.procsMistsOfSheilun).toFixed(2) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.selectedCombatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id) && ((parser.modules.aoeHealingTracker.healsRJW / parser.modules.aoeHealingTracker.castRJW) / 78 ).toFixed(4)) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.renewingMist.dancingMistHeal}</td></tr>
            <tr style={styles.cellBorder}><td>{(((parser.modules.essenceFontMastery.healEF / 2) / parser.modules.essenceFontMastery.castEF) || 0).toFixed(2)}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.essenceFontMastery.targetsEF / parser.modules.essenceFontMastery.castEF).toFixed(2) || 0}</td></tr>
            <tr><td>{(parser.modules.chiBurst.targetsChiBurst / parser.modules.chiBurst.castChiBurst).toFixed(2) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{((parser.modules.amalgamsSeventhSpine.manaGained / parser.fightDuration * 1000 * 5) || 0) + ((parser.modules.darkmoonDeckPromises.manaGained / parser.fightDuration * 1000 * 5) || 0)}</td></tr>
            <tr>
              <td>
                {(((parser.modules.prydaz.healing || 0) +
                (parser.modules.velens.healing || 0) +
                (parser.modules.drapeOfShame.healing || 0) +
                (parser.modules.gnawedThumbRing.healingIncreaseHealing || 0) +
                (parser.modules.archiveOfFaith.healing + parser.modules.archiveOfFaith.healingOverTime || 0) +
                (parser.modules.barbaricMindslaver.healing || 0) +
                (parser.modules.seaStar.healing || 0) +
                (parser.modules.deceiversGrandDesign.healing + parser.modules.deceiversGrandDesign.healingAbsorb || 0) +
                (parser.modules.eithas.healing || 0) +
                (parser.modules.shelterOfRin.healing || 0) +
                (parser.modules.doorwayToNowhere.healing || 0) +
                (parser.modules.ovydsWinterWrap.healing || 0)) / parser.fightDuration * 1000).toFixed(0)}
              </td>
            </tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.t20_2pc.manaSaved / parser.fightDuration * 1000 * 5).toFixed(0) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.selectedCombatant.getBuffUptime(SPELLS.DANCE_OF_MISTS.id)/parser.fightDuration).toFixed(4) || 0}</td></tr>
          </table>
          </div>
        </div>
      </div>
    );
  }
}

export default MonkSpreadsheet;
