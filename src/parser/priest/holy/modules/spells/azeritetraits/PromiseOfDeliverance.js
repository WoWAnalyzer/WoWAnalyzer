import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatNumber, formatPercentage } from 'common/format';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import HolyWordSerenity from 'parser/priest/holy/modules/spells/holyword/HolyWordSerenity';
import SpellUsable from 'parser/priest/holy/modules/features/SpellUsable';

const SPELLS_THAT_PROC_POD = [SPELLS.FLASH_HEAL.id, SPELLS.GREATER_HEAL.id];
const PROMISE_COOLDOWN_REDUCTION_AMOUNT = 1000;

/*
  For 10 sec after you cast Holy Word: Serenity, Heal and Flash Heal heal for an additional 472, and reduce the cooldown of Holy Word: Serenity by an additional 1 sec.
  Example Log: /report/kBKQFTjRvZxynYw9/1-Normal+Taloc+-+Kill+(3:46)/3-Mystichealer
 */
class PromiseOfDeliverance extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    holyWordSerenity: HolyWordSerenity,
  };

  buffActive = false;
  healingDone = 0;
  overhealingDone = 0;
  cooldownReduced = 0;
  promiseOfDeliverenceProcAmount = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PROMISE_OF_DELIVERANCE.id);

    if (this.active) {
      this.ranks = this.selectedCombatant.traitRanks(SPELLS.PROMISE_OF_DELIVERANCE.id) || [];
      this.promiseOfDeliverenceProcAmount = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.PROMISE_OF_DELIVERANCE.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (this.buffActive && SPELLS_THAT_PROC_POD.includes(spellId)) {
      const overhealAmount = Math.min(this.promiseOfDeliverenceProcAmount, (event.overheal || 0));
      const healAmount = this.promiseOfDeliverenceProcAmount - overhealAmount;

      this.healingDone += healAmount;
      this.overhealingDone += overhealAmount;
    }
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PROMISE_OF_DELIVERANCE_BUFF.id) {
      this.buffActive = true;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PROMISE_OF_DELIVERANCE_BUFF.id) {
      this.buffActive = false;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (this.buffActive && SPELLS_THAT_PROC_POD.includes(spellId)) {
      this.cooldownReduced += PROMISE_COOLDOWN_REDUCTION_AMOUNT;

      this.holyWordSerenity.baseHolyWordReductionBySpell[spellId] += PROMISE_COOLDOWN_REDUCTION_AMOUNT;
      if (this.spellUsable.isOnCooldown(SPELLS.HOLY_WORD_SERENITY.id)) {
        this.spellUsable.reduceCooldown(SPELLS.HOLY_WORD_SERENITY.id, PROMISE_COOLDOWN_REDUCTION_AMOUNT, event.timestamp);
      }
    }
  }

  statistic() {

    return (
      <TraitStatisticBox
        trait={SPELLS.PROMISE_OF_DELIVERANCE.id}
        value={<ItemHealingDone amount={this.healingDone} />}
        tooltip={`
          Healing Done: ${formatNumber(this.healingDone)} (${formatPercentage(this.overhealingDone / (this.healingDone + this.overhealingDone))}% OH).<br />
          ${SPELLS.HOLY_WORD_SERENITY.name} Cooldown reduced by ${Math.floor(this.cooldownReduced / 1000)} seconds.
        `}
      />
    );
  }
}

export default PromiseOfDeliverance;
