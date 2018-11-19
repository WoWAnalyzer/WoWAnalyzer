import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import { formatNumber } from 'common/format';

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
 *
 * Example log: /report/kq6T4Rd3v1nmbNHK/3-Heroic+Taloc+-+Kill+(4:46)/17-Budgiechrist
 */
class DeathThroes extends Analyzer {
  damageValue = 0;
  damageDone = 0;
  insanityGained = 0;

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
    if (spellId !== SPELLS.SHADOW_WORD_PAIN.id) {
      return;
    }
    this.damageDone += this.damageValue;
  }

  on_byPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEATH_THROES_ENERGIZE.id) {
      return;
    }
    this.insanityGained += event.resourceChange;
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
      this.damageDone -= this.damageValue;
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.DEATH_THROES.id}
        value={<ItemDamageDone amount={this.damageDone} />}
        tooltip={`
          ${formatNumber(this.damageDone)} additional damage dealt by ${SPELLS.SHADOW_WORD_PAIN.name}<br />
          ${formatNumber(this.insanityGained)} additional insanity generated.
        `}
      />
    );
  }
}

export default DeathThroes;
