import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import Events from 'parser/core/Events';

 /**
 * Your healing spells have a chance to apply Blessed Portents for 20 sec.
 * When the ally falls below 50% health, Blessed Portents is consumed
 * and instantly restores X health.
 */
class BlessedPortents extends Analyzer {
  healing = 0;
  proccedBuffs = 0;
  expiredBuffs = 0;
  refreshedBuffs = 0;
  activeBuffs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BLESSED_PORTENTS.id);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.BLESSED_PORTENTS_HEAL), this.onHeal);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLESSED_PORTENTS_BUFF), this.onApplyBuff);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLESSED_PORTENTS_BUFF), this.onRemoveBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLESSED_PORTENTS_BUFF), this.onRefreshBuff);
  }

  onHeal(event) {
    this.healing += event.amount + (event.absorbed || 0);

    this.proccedBuffs += 1;
    this.expiredBuffs -= 1;
  }

  onApplyBuff(event) {
    this.activeBuffs += 1;
  }

  onRemoveBuff(event) {
    this.expiredBuffs += 1;
    this.activeBuffs -= 1;
  }

  onRefreshBuff(event) {
    this.refreshedBuffs += 1;
  }
  get totalBuffs() {
    return this.proccedBuffs + this.expiredBuffs + this.refreshedBuffs + this.activeBuffs;
  }

  statistic() {
    const healingThroughputPercent = this.owner.getPercentageOfTotalHealingDone(this.healing);
    const hps = this.healing / this.owner.fightDuration * 1000;
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BLESSED_PORTENTS.id}
        value={`${formatPercentage(healingThroughputPercent)} % / ${formatNumber(hps)} HPS`}
        tooltip={(
          <>
            Applied <strong>{formatNumber(this.totalBuffs)}</strong> buffs, <strong>{formatNumber(this.refreshedBuffs)}</strong> were refreshes.
            <ul>
              <li>Procced: <strong>{formatNumber(this.proccedBuffs)}</strong></li>
              <li>Expired: <strong>{formatNumber(this.expiredBuffs)}</strong></li>
              <li>Active at encounter end: <strong>{formatNumber(this.activeBuffs)}</strong></li>
            </ul>
          </>
        )}
      />
    );
  }
}

 export default BlessedPortents;
