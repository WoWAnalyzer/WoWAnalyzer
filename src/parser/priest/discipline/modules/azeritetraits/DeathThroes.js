import React from 'react';

import HIT_TYPES from 'game/HIT_TYPES';
import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber, formatPercentage } from 'common/format';
import AtonementDamageSource from 'parser/priest/discipline/modules/features/AtonementDamageSource';
import isAtonement from 'parser/priest/discipline/modules/core/isAtonement';
import SpellLink from 'common/SpellLink';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import { DISC_PRIEST_DAMAGE_REDUCTION } from '../../constants';

const debug = false;

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
  get hasPurgeTheWicked() {
    return this.selectedCombatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id);
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEATH_THROES.id);
    if (!this.active) {
      return;
    }

    const { damage } = deathThroesStats(this.selectedCombatant.traitsBySpellId[SPELLS.DEATH_THROES.id]);
    // Reduce damage based on the disc priest damage nerf.
    this.damageValue = damage * (1 - DISC_PRIEST_DAMAGE_REDUCTION);
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

    if (damageEvent.amount === 0) {
      return;
    }

    // Calculate how much of the healing should be attributed to Death Throes
    // The damage can't be more than the damage value for DT, nor can it be more than the damage that this ability did.
    // This prevents us from saying DT did more than 100% damage
    let realDamage;
    if (damageEvent.hitType === HIT_TYPES.CRIT) {
      realDamage = Math.min(this.damageValue * 2, damageEvent.amount);
    } else {
      realDamage = Math.min(this.damageValue, damageEvent.amount);
    }
    const deathThroesDamagePercent = realDamage / damageEvent.amount;

    // Calculate how much healing DT should theoretically be doing.
    const amountHealed = (((healingEvent.amount || 0) + (healingEvent.absorbed || 0)) * deathThroesDamagePercent);

    // Calculate how much overhealing should be attributed to DT.
    const amountOverhealed = Math.min((healingEvent.overheal || 0), amountHealed);

    // Calculate the effective healing done.If it was a full overheal, just say it was 0.
    const effectiveAmountHealed = Math.max(amountHealed - amountOverhealed, 0);

    if (debug) {
      console.log('Death Throes proc\'d an atonement', {
        swp_damage: damageEvent.amount,
        realDamage,
        deathThroesDamagePercent: Math.floor(deathThroesDamagePercent * 100) + '%',
        amountHealed,
        amountOverhealed,
        effectiveAmountHealed,
      });
    }

    this.atonementHealing.effective += effectiveAmountHealed;
    this.atonementHealing.over += amountOverhealed;
  }

  statistic() {
    console.log(
      this.tick,
      this.non_tick,
    );
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
            {formatNumber(this.damageDone)} additional damage dealt by {this.hasPurgeTheWicked ? SPELLS.PURGE_THE_WICKED_TALENT.name : SPELLS.SHADOW_WORD_PAIN.name}<br />
            {formatNumber(this.atonementHealing.effective)} additional healing from <SpellLink id={SPELLS.ATONEMENT_BUFF.id} /> ({formatPercentage(this.percentOverHealing)}%OH).
          </>
        )}
      />
    );
  }
}

export default DeathThroes;
