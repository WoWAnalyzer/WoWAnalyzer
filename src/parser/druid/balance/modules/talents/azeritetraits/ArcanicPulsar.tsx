import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import Events from 'parser/core/Events';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { calculateAzeriteEffects } from 'common/stats';

class ArcanicPulsar extends Analyzer {
  /**
   * Starsurge's damage is increased by 2181. Every 9 Starsurges, gain
   * Celestial Alignment for 6 sec.
   *
   * Example Log:
   *
   */

  protected damageGained = 0;
  protected bonusDamage = 0;
  protected firstStarsurgeCast = true;
  protected celestialAlignmentCount = 0;

  constructor(options: any) {
    super(options);
    this.active
      = this.selectedCombatant.hasTrait(SPELLS.ARCANIC_PULSAR_TRAIT.id);

    if (!this.active) {
      return;
    }

    this.bonusDamage
      = this.selectedCombatant.traitsBySpellId[SPELLS.ARCANIC_PULSAR_TRAIT.id]
      .reduce((total, rank) => {
        const [damage] = calculateAzeriteEffects(
          SPELLS.ARCANIC_PULSAR_TRAIT.id,
          rank,
        );
        return total + damage;
      }, 0);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER)
        .spell(SPELLS.STARSURGE_MOONKIN),
      this.onStarsurgeCast,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(SPELLS.STARSURGE_MOONKIN),
      this.onStarsurgeDamage,
    );
  }

  onStarsurgeCast() {
    if (this.firstStarsurgeCast) {
      this.firstStarsurgeCast = false;
      return;
    }

    const buff = this.selectedCombatant.getBuff(SPELLS.ARCANIC_PULSAR_BUFF.id);
    if (!buff) {
      this.celestialAlignmentCount++;
    }
  }

  onStarsurgeDamage() {
    this.damageGained += this.bonusDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={'ITEMS'}
        tooltip={`Celestial Alignment was triggered ${this.celestialAlignmentCount} times.`}
      >
        <BoringSpellValueText spell={SPELLS.ARCANIC_PULSAR_TRAIT}>
          <ItemDamageDone amount={this.damageGained} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcanicPulsar;
