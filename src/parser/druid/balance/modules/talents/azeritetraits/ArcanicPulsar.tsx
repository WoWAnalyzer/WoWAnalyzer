import React from 'react';
import SPELLS from 'common/SPELLS/index';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import Statistic from 'interface/statistics/Statistic';
import Events, {
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { calculateAzeriteEffects } from 'common/stats';
import calculateBonusAzeriteDamage
  from '../../../../../core/calculateBonusAzeriteDamage';

const STARSURGE_SP_COEFFICENT_MODIFIER = 2.3; // 230%

class ArcanicPulsar extends Analyzer {
  /**
   * Starsurge's damage is increased by 2181. Every 9 Starsurges, gain
   * Celestial Alignment for 6 sec.
   *
   * Example Log:
   * https://www.warcraftlogs.com/reports/ZfcqAWCn7gHtp49G#fight=17&type=auras&ability=287790
   *
   */

  protected lastSpellPower = 0;
  protected damageGained = 0;
  protected bonusDamage = 0;
  protected celestialAlignmentTriggers = 0;
  protected currentStacks = 0;

  constructor(options: any) {
    super(options);

    if (!this.selectedCombatant.hasTrait(SPELLS.ARCANIC_PULSAR_TRAIT.id)) {
      this.active = false;
      return;
    }

    this.bonusDamage
      = this.selectedCombatant.traitsBySpellId[SPELLS.ARCANIC_PULSAR_TRAIT.id]
      .reduce((sum, rank) => sum +
        calculateAzeriteEffects(SPELLS.ARCANIC_PULSAR_TRAIT.id, rank)[0], 0);

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER)
        .spell(SPELLS.ARCANIC_PULSAR_BUFF),
      this.onArcanicPulsarStackApplied,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER)
        .spell(SPELLS.ARCANIC_PULSAR_BUFF),
      this.onRemoveArcanicPulsarBuff,
    );

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

  // We are only interested in the 8th stack. Range: [2-8]
  onArcanicPulsarStackApplied(event: ApplyBuffStackEvent) {
    this.currentStacks = event.stack;
  }

  // Triggered when the 9th stack should 'applied' or when the player dies.
  onRemoveArcanicPulsarBuff(event: RemoveBuffEvent) {
    this.currentStacks = 0;
  }

  onStarsurgeCast(event: CastEvent) {
    // Store spellpower for when the azerite trait damage has to be calculated.
    // Starsurge has projectile travel time.
    if (event.spellPower !== undefined && event.spellPower > 0) {
      this.lastSpellPower = event.spellPower;
    }
  }

  onStarsurgeDamage(event: DamageEvent) {
    this.damageGained += calculateBonusAzeriteDamage(
      event,
      [this.bonusDamage],
      this.lastSpellPower,
      STARSURGE_SP_COEFFICENT_MODIFIER,
    )[0];

    // A 9th stack is never applied, instead the buff is removed. The stack is
    // always applied after damage has been dealth. Thus having 8th stacks
    // should trigger Celestial Alignment.
    if (this.currentStacks === 8) {
      this.celestialAlignmentTriggers++;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={'ITEMS'}
        tooltip={`Celestial Alignment was triggered ${this.celestialAlignmentTriggers} times.`}
      >
        <BoringSpellValueText spell={SPELLS.ARCANIC_PULSAR_TRAIT}>
          <ItemDamageDone amount={this.damageGained} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcanicPulsar;
