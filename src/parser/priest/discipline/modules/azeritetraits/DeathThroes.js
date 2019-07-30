import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber } from 'common/format';
import AtonementDamageSource from 'parser/priest/discipline/modules/features/AtonementDamageSource';
import isAtonement from 'parser/priest/discipline/modules/core/isAtonement';
import HealingValue from 'parser/shared/modules/HealingValue';
import SpellLink from 'common/SpellLink';

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

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEATH_THROES.id);
    if (!this.active) {
      return;
    }

    const { damage } = deathThroesStats(this.selectedCombatant.traitsBySpellId[SPELLS.DEATH_THROES.id]);
    this.damageValue = damage;
  }

  get atonementContribution() {

  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SHADOW_WORD_PAIN.id && spellId !== SPELLS.PURGE_THE_WICKED_BUFF.id) {
      return;
    }
    this.damageDone += this.damageValue;
  }

  on_byPlayer_heal(event) {
    const sourceEvent = this.atonementDamageSource.event;
    if (!isAtonement(event) || !sourceEvent) {
      return;
    }
    const healing = this._calculateHealing(sourceEvent, event)
  }

  _addHealing(source, amount = 0, absorbed = 0, overheal = 0) {
    const ability = source.ability;



    // We know how much healing this atonement is going to do, but we need to find out how much of that is because of Death Throes
    const deathThroesDamagePercent = this.damageValue / source.amount;
    console.log(deathThroesDamagePercent);

    this.atonementHealing.effective += amount;
    this.atonementHealing.over += overheal;
  }

  _calculateHealing(swpEvent, atonementEvent) {
    if (swpEvent.ability.guid !== SPELLS.SHADOW_WORD_PAIN.id && swpEvent.ability.guid !== SPELLS.PURGE_THE_WICKED_BUFF.id) {
      return;
    }
    if (!isAtonement(atonementEvent)) {
      return;
    }

    const deathThroesDamagePercent = this.damageValue / swpEvent.amount;

    const amountHealed = (atonementEvent.amount * deathThroesDamagePercent);
    const amountOverhealed = Math.min((atonementEvent.overheal || 0), this.damageValue);
  }

  on_byPlayer_applydebuff(event) {
    this._handleSWP(event);
  }

  on_byPlayer_refreshdebuff(event) {
    this._handleSWP(event);
  }

  _handleSWP(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOW_WORD_PAIN.id) {
      // We need to ignore the initial application damage because it's not increased.
      // We could do this via some time buffer setup, but this is far easier.
      // This is only done for SWP, as Purge the Wicked has different spell ID's for the buff portion.
      this.damageDone -= this.damageValue;
    }
  }

  statistic() {
    console.log('hit');
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.DEATH_THROES.id}
        value={<ItemDamageDone amount={this.damageDone} />}
        tooltip={(
          <>
            {formatNumber(this.damageDone)} additional damage dealt by {SPELLS.SHADOW_WORD_PAIN.name}<br />
            {formatNumber(this.atonementHealing)} additional healing from <SpellLink id={SPELLS.ATONEMENT_BUFF.id} />.
          </>
        )}
      />
    );
  }
}

export default DeathThroes;
