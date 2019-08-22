import React from 'react';

import SPELLS from 'common/SPELLS/index';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import calculateBonusAzeriteDamage from 'parser/core/calculateBonusAzeriteDamage';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import Events from 'parser/core/Events';
import { formatNumber } from 'common/format';
import StatTracker from 'parser/shared/modules/StatTracker';

const SHADOWY_APPARITION_COEFFICIENT = 0.25;

/**
 * Spiteful Apparitions
 * Shadowy Apparitions deal an additional 2544 damage to enemies suffering from your Vampiric Touch.
 *
 * Example log: /report/JQNwLbpdtmrzYAGC/5-Mythic+Blackwater+Behemoth+-+Kill+(5:09)/Adoraci
 */
class SpitefulApparitions extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    statTracker: StatTracker,
  };

  damageDone = 0;
  traitBonus = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SPITEFUL_APPARITIONS.id);
    if (!this.active) {
      return;
    }

    this.traitBonus = this.selectedCombatant.traitsBySpellId[SPELLS.SPITEFUL_APPARITIONS.id]
      .reduce((sum, rank) => sum + calculateAzeriteEffects(SPELLS.SPITEFUL_APPARITIONS.id, rank)[0], 0);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_DAMAGE), this.onDamageEvent);
  }

  onDamageEvent(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    if (!enemy.hasBuff(SPELLS.VAMPIRIC_TOUCH.id, event.timestamp)) {
      return;
    }
    this.damageDone += calculateBonusAzeriteDamage(event, [this.traitBonus], SHADOWY_APPARITION_COEFFICIENT, this.statTracker.currentIntellectRating)[0];
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SPITEFUL_APPARITIONS.id}
        value={<ItemDamageDone amount={this.damageDone} />}
        tooltip={(
          <>
            {formatNumber(this.damageDone)} additional damage dealt by {SPELLS.SHADOWY_APPARITION.name} to targets affected by {SPELLS.VAMPIRIC_TOUCH.name}.
          </>
        )}
      />
    );
  }
}

export default SpitefulApparitions;
