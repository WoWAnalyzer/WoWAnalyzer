import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import CritIcon from 'interface/icons/CriticalStrike';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';

const blightborneInfusionStats = traits => Object.values(traits).reduce((total, rank) => {
  const [crit] = calculateAzeriteEffects(SPELLS.BLIGHTBORNE_INFUSION.id, rank);
  return total + crit;
}, 0);

/**
 * Blightborne Infusion:
 * Your spells and abilities have a chance to draw a Wandering Soul from Thros to serve you for 14 sec.
 * The Soul increases your Critical Strike by 768.
 *
 * Test Log: /report/ABH7D8W1Qaqv96mt/2-Mythic+Taloc+-+Kill+(4:12)/Rhonk/statistics
 */
class BlightborneInfusion extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  crit = 0;
  blightborneInfusionProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BLIGHTBORNE_INFUSION.id);
    if (!this.active) {
      return;
    }

    this.crit = blightborneInfusionStats(this.selectedCombatant.traitsBySpellId[SPELLS.BLIGHTBORNE_INFUSION.id]);

    // checking again if the player has this trait, as https://www.wowhead.com/spell=273150/ruinous-bolt can trigger the same buff but without a crit property
    this.statTracker.add(SPELLS.BLIGHTBORNE_INFUSION_BUFF.id, {
      crit: combatant => combatant.hasTrait(SPELLS.BLIGHTBORNE_INFUSION.id) ? blightborneInfusionStats(combatant.traitsBySpellId[SPELLS.BLIGHTBORNE_INFUSION.id]) : 0,
    });
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLIGHTBORNE_INFUSION_BUFF), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLIGHTBORNE_INFUSION_BUFF), this.onRefreshBuff);
  }

  onApplyBuff(event) {
    this.blightborneInfusionProcs += 1;
  }

  onRefreshBuff(event) {
    this.blightborneInfusionProcs += 1;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BLIGHTBORNE_INFUSION_BUFF.id) / this.owner.fightDuration;
  }

  get averageCrit() {
    return (this.crit * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={(
          <>
            {SPELLS.BLIGHTBORNE_INFUSION.name} grants <strong>{this.crit} crit</strong> while active.<br />
            You procced <strong>{SPELLS.BLIGHTBORNE_INFUSION.name} {this.blightborneInfusionProcs} times</strong> with an uptime of {formatPercentage(this.uptime)}%.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.BLIGHTBORNE_INFUSION}>
          <CritIcon /> {this.averageCrit} <small>average Critical Strike</small>
        </BoringSpellValueText>
      </ItemStatistic>
    );
  }
}

export default BlightborneInfusion;
