import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber } from 'common/format';

const woundBinderStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [haste] = calculateAzeriteEffects(SPELLS.WOUNDBINDER.id, rank);
  obj.haste += haste;
  return obj;
}, {
  haste: 0,
});

const BASE_HASTE_AMOUNT = .34;

/**
 Your healing effects have a chance to increase your Haste by up to 435 for 6 sec. Healing lower health targets will grant you more Haste.

 There is no true documentation for how this trait works. Throeycrafters in the Holy Priest Discord have come up with this:

 This trait scales linearly starting at with 34% of the haste at 0% health and 100% at 100% health.

 Example Report: /report/yqwzpPZVhWJ6Qtj1/8-Normal+Taloc+-+Kill+(2:54)/22-Fearrful
 */
class WoundBinder extends Analyzer {
  procs = [0];
  proccedOnce = false;
  lastTargetHealedPercent = 1;
  fullHasteValue = 0;

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WOUNDBINDER_BUFF.id) / this.owner.fightDuration;
  }

  get averageHasteProcAmount() {
    const sum = this.procs.reduce(function (a, b) {
      return a + b;
    });
    const avg = sum / this.procs.length;
    return avg;
  }

  get averageHaste() {
    return this.averageHasteProcAmount * this.uptime;
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WOUNDBINDER.id);

    if (this.active) {
      const { haste } = woundBinderStats(this.selectedCombatant.traitsBySpellId[SPELLS.WOUNDBINDER.id]);
      this.fullHasteValue = haste;
    }
  }

  calculateHasteAmount(targetHealthPercent = 1) {
    // The formula is HasteGained = .34 + (.66 * percentMissingHealth)
    return this.fullHasteValue * (BASE_HASTE_AMOUNT + ((1 - BASE_HASTE_AMOUNT) * (1 - targetHealthPercent)));
  }

  on_byPlayer_heal(event) {
    // We track the last heal from the player to use for the haste calculation
    this.lastTargetHealedPercent = (event.hitPoints / event.maxHitPoints);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.WOUNDBINDER_BUFF.id) {
      return;
    }
    if (!this.proccedOnce) {
      this.procs.splice(0, 1);
    }
    this.proccedOnce = true;
    this.procs.push(this.calculateHasteAmount(this.lastTargetHealedPercent));
  }

  on_finished() {

  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.WOUNDBINDER.id}
        value={`${formatNumber(this.averageHaste)} average Haste`}
        tooltip={`${this.proccedOnce ? this.procs.length : '0'} total ${this.procs.length > 1 || this.procs.length === 0 ? 'procs' : 'proc'}${this.proccedOnce ? ` for [${this.procs.map((value) => Math.floor(value)).join(', ')}] haste` : ''}. `}
      />
    );
  }
}

export default WoundBinder;
