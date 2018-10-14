import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';

const PRE_INTELLECT_POTION_BUFF = 900;

class RestorationShamanSpreadsheet extends React.Component {
  static propTypes = {
    parser: PropTypes.object.isRequired,
  };

  render() {
    const { parser } = this.props;

    const styles = {
      table: { borderBottom: '1px solid #dddddd', borderTop: '1px solid #dddddd', align: 'right', padding: '20px', float: 'left', margin: '5px', borderCollapse: 'separate', borderSpacing: '10px 0' },
    };

    const getAbility = spellId => parser._modules.abilityTracker.getAbility(spellId);
    const casts = spellId => getAbility(spellId).casts;
    const cpm = spellId => casts(spellId) / (parser.fightDuration / 1000 / 60) >= 0 ? (casts(spellId) / (parser.fightDuration / 1000 / 60)).toFixed(2) : '0';
    const prePotion = parser._modules.prePotion.usedPrePotion ? PRE_INTELLECT_POTION_BUFF : 0;

    return (
      <div>
        <div style={{ padding: '0px 22px 15px 0px' }}>Please use the below table to populate the Restoration Shaman Spreadsheet. <a href="https://ancestralguidance.com/spreadsheet/">Link to the sheet</a><br /></div>
          <table style={styles.table} >
            <tbody>
              <tr><td>{parser.selectedCombatant._combatantInfo.intellect - prePotion}</td></tr>
              <tr><td>{parser.selectedCombatant._combatantInfo.critSpell}</td></tr>
              <tr><td>{parser.selectedCombatant._combatantInfo.hasteSpell}</td></tr>
              <tr><td>{parser.selectedCombatant._combatantInfo.mastery}</td></tr>
              <tr><td>{parser.selectedCombatant._combatantInfo.versatilityHealingDone}</td></tr>
              <tr><td>{Math.floor(parser.fightDuration / 1000)}</td></tr>
              <tr><td>{parser._modules.statValues.hpsPerIntellect.toFixed(2)}</td></tr>
              <tr><td>{parser._modules.statValues.hpsPerCriticalStrike.toFixed(2)}</td></tr>
              <tr><td>{parser._modules.statValues.hpsPerHaste.toFixed(2)}</td></tr>
              <tr><td>{parser._modules.statValues.hpsPerMastery.toFixed(2)}</td></tr>
              <tr><td>{parser._modules.statValues.hpsPerVersatility.toFixed(2)}</td></tr>
              <tr><td>{cpm(SPELLS.RIPTIDE.id)}</td></tr>
              <tr><td>{cpm(SPELLS.HEALING_RAIN_CAST.id)}</td></tr>
              <tr><td>{cpm(SPELLS.HEALING_TIDE_TOTEM_CAST.id)}</td></tr>
              <tr><td>{cpm(SPELLS.SPIRIT_LINK_TOTEM.id)}</td></tr>
              <tr><td>{parser.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id) ? cpm(SPELLS.CLOUDBURST_TOTEM_TALENT.id) : cpm(SPELLS.HEALING_STREAM_TOTEM_CAST.id)}</td></tr>
              <tr><td>{cpm(SPELLS.CHAIN_HEAL.id)}</td></tr>
              <tr><td>{parser._modules.spreadsheet.surgingTideProcsPerMinute}</td></tr>
              <tr><td>{(parser._modules.spreadsheet.spoutingSpiritsHits / casts(SPELLS.SPIRIT_LINK_TOTEM.id) || 0).toFixed(2)}</td></tr>
              <tr><td>{(parser._modules.spreadsheet.overflowingShoresHits / casts(SPELLS.HEALING_RAIN_CAST.id) || 0).toFixed(2)}</td></tr>
              <tr><td>{parser._modules.spreadsheet.ebbAndFlowEffectiveness.toFixed(2)}</td></tr>
              <tr><td>{parser._modules.combatants.playerCount}</td></tr>
              <tr><td>{cpm(SPELLS.ASTRAL_SHIFT.id)}</td></tr>
              <tr><td>{(parser.selectedCombatant.getBuffUptime(SPELLS.GHOST_WOLF.id) / 1000).toFixed(2)}</td></tr>
              <tr><td>{parser._modules.masteryEffectiveness.masteryEffectivenessPercent.toFixed(2)}</td></tr>
              <tr><td>{parser.selectedCombatant.race ? parser.selectedCombatant.race.name : 'Unknown'}</td></tr>
              <tr><td>{(getAbility(SPELLS.HEALING_WAVE.id).healingTwHits / (parser.fightDuration / 1000 / 60)).toFixed(2)}</td></tr>
              <tr><td>{(getAbility(SPELLS.HEALING_SURGE_RESTORATION.id).healingTwHits / (parser.fightDuration / 1000 / 60)).toFixed(2)}</td></tr>
            </tbody>
          </table>
      </div>
    );
  }
}

export default RestorationShamanSpreadsheet;
