import React from 'react';
import PropTypes from 'prop-types';

import SPELLS from 'common/SPELLS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import PrePotion from 'parser/shared/modules/items/PrePotion';
import BaseHealerStatValues from 'parser/shared/modules/features/BaseHealerStatValues';
import SurgingTides from 'parser/shaman/restoration/modules/azerite/SurgingTides';
import SpoutingSpirits from 'parser/shaman/restoration/modules/azerite/SpoutingSpirits';
import OverflowingShores from 'parser/shaman/restoration/modules/azerite/OverflowingShores';
import Combatants from 'parser/shared/modules/Combatants';
import MasteryEffectiveness from 'parser/shaman/restoration/modules/features/MasteryEffectiveness';
import DistanceMoved from 'parser/shared/modules/others/DistanceMoved';

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

    const minutes = (parser.fightDuration / 1000 / 60);
    const getAbility = spellId => parser.getModule(AbilityTracker).getAbility(spellId);
    const casts = spellId => getAbility(spellId).casts;
    const cpm = (spellId, TW = undefined) => {
      const castAmount = TW ? getAbility(spellId).healingTwHits : casts(spellId);
      return castAmount / minutes >= 0 ? (castAmount / minutes).toFixed(2) : '0';
    };
    const prePotion = parser.getModule(PrePotion).usedPrePotion ? PRE_INTELLECT_POTION_BUFF : 0;

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
              <tr><td>{parser.getModule(BaseHealerStatValues).hpsPerIntellect.toFixed(2)}</td></tr>
              <tr><td>{parser.getModule(BaseHealerStatValues).hpsPerCriticalStrike.toFixed(2)}</td></tr>
              <tr><td>{parser.getModule(BaseHealerStatValues).hpsPerHaste.toFixed(2)}</td></tr>
              <tr><td>{parser.getModule(BaseHealerStatValues).hpsPerMastery.toFixed(2)}</td></tr>
              <tr><td>{parser.getModule(BaseHealerStatValues).hpsPerVersatility.toFixed(2)}</td></tr>
              <tr><td>{cpm(SPELLS.RIPTIDE.id)}</td></tr>
              <tr><td>{cpm(SPELLS.HEALING_RAIN_CAST.id)}</td></tr>
              <tr><td>{cpm(SPELLS.HEALING_TIDE_TOTEM_CAST.id)}</td></tr>
              <tr><td>{cpm(SPELLS.SPIRIT_LINK_TOTEM.id)}</td></tr>
              <tr><td>{parser.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id) ? cpm(SPELLS.CLOUDBURST_TOTEM_TALENT.id) : cpm(SPELLS.HEALING_STREAM_TOTEM_CAST.id)}</td></tr>
              <tr><td>{cpm(SPELLS.CHAIN_HEAL.id)}</td></tr>
              <tr><td>{parser.getModule(SurgingTides).surgingTideProcsPerMinute}</td></tr>
              <tr><td>{((parser.getModule(SpoutingSpirits).spoutingSpiritsHits || getAbility(SPELLS.SPOUTING_SPIRITS_HEAL.id).healingHits) / casts(SPELLS.SPIRIT_LINK_TOTEM.id) || 0).toFixed(2)}</td></tr>
              <tr><td>{((parser.getModule(OverflowingShores).overflowingShoresHits || getAbility(SPELLS.OVERFLOWING_SHORES_HEAL.id).healingHits) / casts(SPELLS.HEALING_RAIN_CAST.id) || 0).toFixed(2)}</td></tr>
              <tr><td>{1 - (parser.getModule(DistanceMoved).timeSpentMoving / parser.fightDuration).toFixed(2)}</td></tr>
              <tr><td>{parser.getModule(Combatants).playerCount}</td></tr>
              <tr><td>{cpm(SPELLS.ASTRAL_SHIFT.id)}</td></tr>
              <tr><td>{(parser.selectedCombatant.getBuffUptime(SPELLS.GHOST_WOLF.id) / 1000).toFixed(2)}</td></tr>
              <tr><td>{parser.getModule(MasteryEffectiveness).masteryEffectivenessPercent.toFixed(2)}</td></tr>
              <tr><td>{parser.selectedCombatant.race ? parser.selectedCombatant.race.name : 'Unknown'}</td></tr>
              <tr><td>{cpm(SPELLS.HEALING_WAVE.id,true)}</td></tr>
              <tr><td>{cpm(SPELLS.HEALING_SURGE_RESTORATION.id,true)}</td></tr>
            </tbody>
          </table>
      </div>
    );
  }
}

export default RestorationShamanSpreadsheet;
