import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

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

    this.proccedBuffs += 1;
    this.expiredBuffs -= 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId !== SPELLS.BLESSED_PORTENTS_BUFF.id) {
      return;
    }

    this.activeBuffs += 1;
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLESSED_PORTENTS_BUFF.id) {
      return;
    }

    this.expiredBuffs += 1;
    this.activeBuffs -= 1;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLESSED_PORTENTS_BUFF.id) {
      return;
    }

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
