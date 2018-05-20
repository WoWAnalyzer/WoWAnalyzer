import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage, formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import isAtonement from '../Core/isAtonement';
import AtonementDamageSource from '../Features/AtonementDamageSource';

class Schism extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
    atonementDamageSource: AtonementDamageSource,
  };

  static bonus = 0.4;

  directDamage = 0;
  damageFromBuff = 0;
  healing = 0;
  target = null;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(
      SPELLS.SCHISM_TALENT.id
    );
  }

  get buffActive() {
    return this.target && this.target.hasBuff(SPELLS.SCHISM_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    // Handle non-schism events
    if (spellId !== SPELLS.SCHISM_TALENT.id) {
      this.processSchismBuffDamage(event);
      return;
    }

    // Set the target for schism
    this.target = this.enemies.getEntity(event);

    // Add direct schism damage
    this.directDamage += event.amount;
  }

  on_byPlayer_heal(event) {
    if (!isAtonement(event) || !this.buffActive) {
      return;
    }

    // Schism doesn't buff pet damage - yet
    if (this.owner.byPlayerPet(this.atonementDamageSource.event)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, Schism.bonus);
  }

  processSchismBuffDamage(event) {
    if (!this.buffActive || event.targetID !== this.target.id) {
      return;
    }

    this.damageFromBuff += calculateEffectiveDamage(event, Schism.bonus);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SCHISM_TALENT.id} />}
        value={`${formatNumber(
          this.healing / this.owner.fightDuration * 1000
        )} HPS`}
        label={
          <dfn
            data-tip={`
              The effective healing contributed by the Schism bonus was ${formatPercentage(
                this.owner.getPercentageOfTotalHealingDone(this.healing)
              )}% of total healing done.

              The direct damage contributed by the Schism talent was ${formatPercentage(
                this.owner.getPercentageOfTotalDamageDone(this.directDamage)
              )}% of total damage done.

              The effective damage contributed by the Schism bonus ${formatPercentage(
                this.owner.getPercentageOfTotalDamageDone(this.damageFromBuff)
              )}% of total damage done.
            `}
          >
            Schism Output
          </dfn>
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Schism;
