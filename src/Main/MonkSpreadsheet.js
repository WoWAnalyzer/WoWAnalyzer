import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';

class MonkSpreadsheet extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
  };

  activeNLCTraits = [];

  render() {
    const { parser } = this.props;

    const abilityTracker = parser.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);
    const SGability = getAbility(SPELLS.SHEILUNS_GIFT.id);
    const SGcasts = SGability.casts || 0;

    const NLC_TRAITS = [
      SPELLS.CHAOTIC_DARKNESS_TRAIT,
      SPELLS.DARK_SORROWS_TRAIT,
      SPELLS.INFUSION_OF_LIGHT_TRAIT,
      SPELLS.LIGHTS_EMBRACE_TRAIT,
      SPELLS.MURDEROUS_INTENT_TRAIT,
      SPELLS.REFRACTIVE_SHELL_TRAIT,
      SPELLS.SECURE_IN_THE_LIGHT_TRAIT,
      SPELLS.SHADOWBIND_TRAIT,
      SPELLS.SHOCKLIGHT_TRAIT,
      SPELLS.TORMENT_THE_WEAK_TRAIT,
    ];
    
    NLC_TRAITS.forEach(item =>{
      if(parser.modules.combatants.selected.traitsBySpellId[item.id] > 0) {
        this.activeNLCTraits.push(item);
      }
    });
    

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
            <tr style={styles.cellBorder}><td>Concordance Uptime</td></tr>
            <tr style={styles.cellBorder}><td>First NLC Trait</td></tr>
            <tr><td>Second NLC Trait</td></tr>
            <tr><td>Third NLC Trait</td></tr>
            <tr style={styles.cellBorder}><td>Tier 21 2 Piece Tranquil Mists</td></tr>
            <tr><td>Tier 21 4 piece Average Bolts</td></tr>
          </table>
          {
          // This table is separate to allow for easier copy and pasting of the values from this page into the Mistweaver Spreadsheet.
        }
          <table style={styles.table}>
            <tr><td>{Math.floor(parser.fightDuration / 1000 / 60)}</td></tr>
            <tr><td>{Math.floor((parser.fightDuration / 1000) % 60)}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.manaValues.endingMana}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.damageTaken.total.regular / parser.fightDuration * 1000).toFixed(2)}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.thunderFocusTea.castsTft}</td></tr>
            <tr><td>{((parser.modules.thunderFocusTea.castsTftEff / parser.modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr><td>{((parser.modules.thunderFocusTea.castsTftEnm / parser.modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr><td>{((parser.modules.thunderFocusTea.castsTftEf / parser.modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr><td>{((parser.modules.thunderFocusTea.castsTftRem / parser.modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr><td>{((parser.modules.thunderFocusTea.castsTftViv / parser.modules.thunderFocusTea.castsTft) || 0).toFixed(4)}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.upliftingTrance.UTProcsTotal}</td></tr>
            <tr><td>{(1 - (parser.modules.upliftingTrance.consumedUTProc / parser.modules.upliftingTrance.UTProcsTotal)).toFixed(4)}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.manaTea.manaSavedMT / parser.fightDuration * 1000 * 5).toFixed(0)}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.combatants.selected.hasTalent(SPELLS.LIFECYCLES_TALENT.id) && ((parser.modules.lifecycles.castsRedViv / (parser.modules.lifecycles.castsRedViv + parser.modules.lifecycles.castsNonRedViv)).toFixed(4))) || 0}</td></tr>
            <tr><td>{(parser.modules.combatants.selected.hasTalent(SPELLS.LIFECYCLES_TALENT.id) && ((parser.modules.lifecycles.castsRedEnm / (parser.modules.lifecycles.castsRedEnm + parser.modules.lifecycles.castsNonRedEnm)).toFixed(4))) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.spiritOfTheCrane.manaReturnSotc}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.sheilunsGift.stacksTotalSG / SGcasts || 0).toFixed(0)}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.whispersOfShaohao.countWhispersHeal / ((Math.floor(parser.fightDuration / 10000) + parser.modules.sheilunsGift.countEff))).toFixed(4) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{(((parser.modules.celestialBreath.healsCelestialBreath / parser.modules.celestialBreath.procsCelestialBreath) / 3) || 0).toFixed(2)}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.mistsOfSheilun.procsMistsOfSheilun}</td></tr>
            <tr><td>{(parser.modules.mistsOfSheilun.healsMistsOfSheilun / parser.modules.mistsOfSheilun.procsMistsOfSheilun).toFixed(2) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{((parser.modules.combatants.selected.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id) && ((parser.modules.refreshingJadeWind.healsRJW / parser.modules.refreshingJadeWind.castRJW) / 78)) || 0).toFixed(4)}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.renewingMist.dancingMistHeal}</td></tr>
            <tr style={styles.cellBorder}><td>{(((parser.modules.essenceFontMastery.healEF / 2) / parser.modules.essenceFontMastery.castEF) || 0).toFixed(2)}</td></tr>
            <tr style={styles.cellBorder}><td>{((parser.modules.essenceFont.targetsEF / parser.modules.essenceFont.castEF) || 0).toFixed(2)}</td></tr>
            <tr><td>{((parser.modules.chiBurst.targetsChiBurst / parser.modules.chiBurst.castChiBurst) || 0).toFixed(2)}</td></tr>
            <tr style={styles.cellBorder}><td>{((parser.modules.amalgamsSeventhSpine.manaGained / parser.fightDuration * 1000 * 5) || 0) + ((parser.modules.darkmoonDeckPromises.manaGained / parser.fightDuration * 1000 * 5) || 0)}</td></tr>
            <tr>
              <td>
                {(((parser.modules.prydazXavaricsMagnumOpus.healing || 0) +
              (parser.modules.velensFutureSight.healing || 0) +
              (parser.modules.drapeOfShame.healing || 0) +
              (parser.modules.gnawedThumbRing.healing || 0) +
              (parser.modules.archiveOfFaith.healing + parser.modules.archiveOfFaith.healingOverTime || 0) +
              (parser.modules.barbaricMindslaver.healing || 0) +
              (parser.modules.seaStarOfTheDepthmother.healing || 0) +
              (parser.modules.deceiversGrandDesign.healing + parser.modules.deceiversGrandDesign.healingAbsorb || 0) +
              (parser.modules.eithas.healing || 0) +
              (parser.modules.shelterOfRin.healing || 0) +
              (parser.modules.doorwayToNowhere.healing || 0) +
              (parser.modules.ovydsWinterWrap.healing || 0) +
              (parser.modules.eonarsCompassion.totalHeal || 0) +
              (parser.modules.highfathersMachinations.healing || 0) +
              (parser.modules.tarratusKeystone.healing || 0)) / parser.fightDuration * 1000).toFixed(0)}
              </td>
            </tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.t20_2set.manaSaved / parser.fightDuration * 1000 * 5).toFixed(0) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.combatants.selected.getBuffUptime(SPELLS.DANCE_OF_MISTS.id) / parser.fightDuration).toFixed(4) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{(parser.modules.combatants.selected.getBuffUptime(SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_INTELLECT.id) / parser.fightDuration).toFixed(4) || 0}</td></tr>
            <tr style={styles.cellBorder}><td>{(this.activeNLCTraits[0]) ? this.activeNLCTraits[0].name : 'N/A'}</td></tr>
            <tr><td>{(this.activeNLCTraits[1]) ? this.activeNLCTraits[1].name : 'N/A'}</td></tr>
            <tr><td>{(this.activeNLCTraits[2]) ? this.activeNLCTraits[2].name : 'N/A'}</td></tr>
            <tr style={styles.cellBorder}><td>{parser.modules.t21_2set.tranquilMistCount || 0}</td></tr>
            <tr><td>{parser.modules.t21_4set.averageBoltsPerCast || 0}</td></tr>
          </table>
        </div>
      </div>
    );
  }
}

export default MonkSpreadsheet;
