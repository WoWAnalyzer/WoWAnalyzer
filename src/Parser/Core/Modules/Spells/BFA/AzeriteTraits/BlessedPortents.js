import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

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
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLESSED_PORTENTS_HEAL.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);

    this.proccedBuffs++;
    this.expiredBuffs--;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.BLESSED_PORTENTS_BUFF.id) {
      return;
    }

    this.activeBuffs++;
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLESSED_PORTENTS_BUFF.id) {
      return;
    }

    this.expiredBuffs++;
    this.activeBuffs--;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLESSED_PORTENTS_BUFF.id) {
      return;
    }

    this.refreshedBuffs++;
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
        tooltip={`Applied <b>${formatNumber(this.totalBuffs)}</b> buffs,
                  <b>${formatNumber(this.refreshedBuffs)}</b> were refreshes.
                  <ul>
                    <li>Procced: <b>${formatNumber(this.proccedBuffs)}</b></li>
                    <li>Expired: <b>${formatNumber(this.expiredBuffs)}</b></li>
                    <li>Active at encounter end: <b>${formatNumber(this.activeBuffs)}</b></li>
                  </ul>
                `}
      />
    );
  }
}

 export default BlessedPortents;