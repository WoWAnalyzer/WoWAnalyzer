import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
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
   * https://www.warcraftlogs.com/reports/ZfcqAWCn7gHtp49G#fight=17&type=auras&ability=287790
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

  onStarsurgeCast(event: CastEvent) {
    if (this.firstStarsurgeCast) {
      this.firstStarsurgeCast = false;
      return;
    }

    if (!this.selectedCombatant.hasBuff(SPELLS.ARCANIC_PULSAR_BUFF.id)) {
      this.celestialAlignmentCount++;
    }
  }

  onStarsurgeDamage(event: DamageEvent) {
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
