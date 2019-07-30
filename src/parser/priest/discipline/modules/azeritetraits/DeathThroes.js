import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber, formatPercentage } from 'common/format';
import AtonementDamageSource from 'parser/priest/discipline/modules/features/AtonementDamageSource';
import isAtonement from 'parser/priest/discipline/modules/core/isAtonement';
import HealingValue from 'parser/shared/modules/HealingValue';
import SpellLink from 'common/SpellLink';
import ItemHealingDone from 'interface/others/ItemHealingDone';

const deathThroesStats = traits => Object.values(traits).reduce((obj, rank) => {
  const [damage] = calculateAzeriteEffects(SPELLS.DEATH_THROES.id, rank);
  obj.damage += damage;
  return obj;
}, {
  damage: 0,
});

/**
 * Death Throes
 * Shadow Word: Pain deals an additional 1424 damage. When an enemy dies while afflicted by your Shadow Word: Pain, you gain 5 Insanity.
 * This is specifically the Disc version of PtW. The Shadow version is different.
 * Example log: /report/kq6T4Rd3v1nmbNHK/3-Heroic+Taloc+-+Kill+(4:46)/17-Budgiechrist
 */
class DeathThroes extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
  };

  damageValue = 0; // Damage done by each death throes tick
  damageDone = 0; // Total damage done by death throes
  atonementHealing = {
    effective: 0,
    over: 0,
  };
  get percentOverHealing() {
    return this.atonementHealing.over / (this.atonementHealing.effective + this.atonementHealing.over);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEATH_THROES.id);
    if (!this.active) {
      return;
    }

    const { damage } = deathThroesStats(this.selectedCombatant.traitsBySpellId[SPELLS.DEATH_THROES.id]);
    this.damageValue = damage;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOW_WORD_PAIN.id && spellId !== SPELLS.PURGE_THE_WICKED_BUFF.id && !event.ability.tick) {
      return;
    }
    this.damageDone += this.damageValue;
  }

  on_byPlayer_heal(healingEvent) {
    const damageEvent = this.atonementDamageSource.event;

    // Skip any healing that isn't from an atonement event
    if (!isAtonement(healingEvent) || !damageEvent) {
      return;
    }
    // Skip any healing that isn't the result of a SWP cast or a PtW cast
    if (damageEvent.ability.guid !== SPELLS.SHADOW_WORD_PAIN.id && damageEvent.ability.guid !== SPELLS.PURGE_THE_WICKED_BUFF.id) {
      return;
    }

    // Skip any healing that isn't from a tick. Death Throes only increases damage from ticks.
    if (!damageEvent.tick) {
      return;
    }

    const deathThroesDamagePercent = this.damageValue / damageEvent.amount;
    const amountHealed = ((healingEvent.amount || 0) + (healingEvent.absorbed || 0) * deathThroesDamagePercent);
    const amountOverhealed = Math.min((healingEvent.overheal || 0), this.damageValue);
    const effectiveAmountHealed = amountHealed - amountOverhealed;

    this.atonementHealing.effective += effectiveAmountHealed;
    this.atonementHealing.over += amountOverhealed;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.DEATH_THROES.id}
        value={(
          <>
            <ItemDamageDone amount={this.damageDone} /><br />
            <ItemHealingDone amount={this.atonementHealing.effective} />
          </>
        )}
        tooltip={(
          <>
            {formatNumber(this.damageDone)} additional damage dealt by {SPELLS.SHADOW_WORD_PAIN.name}<br />
            {formatNumber(this.atonementHealing.effective)} additional healing from <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> ({formatPercentage(this.percentOverHealing)}%OH).
          </>
        )}
      />
    );
  }
}

export default DeathThroes;
