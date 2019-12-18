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
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import DamageDone from 'parser/shared/modules/throughput/DamageDone';

const PRE_INTELLECT_POTION_BUFF = 900;

const RestorationShamanSpreadsheet = props => {
  const { parser } = props;

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
  const prePotion = parser.getModule(PrePotion).usedPrePotion ? PRE_INTELLECT_POTION_BUFF : 0; // needs update

  const output = [
    parser.selectedCombatant._combatantInfo.intellect - prePotion,
    parser.selectedCombatant._combatantInfo.critSpell,
    parser.selectedCombatant._combatantInfo.hasteSpell,
    parser.selectedCombatant._combatantInfo.mastery,
    parser.selectedCombatant._combatantInfo.versatilityHealingDone,
    Math.floor(parser.fightDuration / 1000),
    parser.getModule(BaseHealerStatValues).hpsPerIntellect.toFixed(2),
    parser.getModule(BaseHealerStatValues).hpsPerCriticalStrike.toFixed(2),
    parser.getModule(BaseHealerStatValues).hpsPerHaste.toFixed(2),
    parser.getModule(BaseHealerStatValues).hpsPerMastery.toFixed(2),
    parser.getModule(BaseHealerStatValues).hpsPerVersatility.toFixed(2),
    cpm(SPELLS.RIPTIDE.id),
    cpm(SPELLS.HEALING_RAIN_CAST.id),
    cpm(SPELLS.HEALING_TIDE_TOTEM_CAST.id),
    cpm(SPELLS.SPIRIT_LINK_TOTEM.id),
    parser.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id) ? cpm(SPELLS.CLOUDBURST_TOTEM_TALENT.id) : cpm(SPELLS.HEALING_STREAM_TOTEM_CAST.id),
    cpm(SPELLS.CHAIN_HEAL.id),
    parser.getModule(SurgingTides).surgingTideProcsPerMinute,
    ((parser.getModule(SpoutingSpirits).spoutingSpiritsHits || getAbility(SPELLS.SPOUTING_SPIRITS_HEAL.id).healingHits) / casts(SPELLS.SPIRIT_LINK_TOTEM.id) || 0).toFixed(2),
    ((parser.getModule(OverflowingShores).overflowingShoresHits || getAbility(SPELLS.OVERFLOWING_SHORES_HEAL.id).healingHits) / casts(SPELLS.HEALING_RAIN_CAST.id) || 0).toFixed(2),
    1 - (parser.getModule(DistanceMoved).timeSpentMoving / parser.fightDuration).toFixed(2),
    parser.getModule(Combatants).playerCount,
    cpm(SPELLS.ASTRAL_SHIFT.id),
    (parser.selectedCombatant.getBuffUptime(SPELLS.GHOST_WOLF.id) / 1000).toFixed(2),
    parser.getModule(MasteryEffectiveness).masteryEffectivenessPercent.toFixed(2),
    parser.selectedCombatant.race ? parser.selectedCombatant.race.name : 'Unknown',
    cpm(SPELLS.HEALING_WAVE.id,true),
    cpm(SPELLS.HEALING_SURGE_RESTORATION.id,true),
    parser.getModule(HealingDone)._total._regular,
    parser.getModule(DamageDone)._total._regular,
  ];

  return (
    <div>
      <div style={{ padding: '0px 22px 15px 0px' }}>Please use the button below or manually copy the table to populate the Restoration Shaman Spreadsheet. <a href="https://ancestralguidance.com/spreadsheet/">Link to the sheet</a><br /></div>
      <button className="btn btn-primary btn-lg" onClick={() => {navigator.clipboard.writeText(output.toString().replace(/,/g,'\n'));}}>Click to copy table contents</button><br />
        <table style={styles.table} >
          <tbody>
            {output.map(row => {
              return (<tr><td>{row}</td></tr>);
            })}
          </tbody>
        </table>
    </div>
  );
};

RestorationShamanSpreadsheet.propTypes = {
  parser: PropTypes.object.isRequired,
};

export default RestorationShamanSpreadsheet;
