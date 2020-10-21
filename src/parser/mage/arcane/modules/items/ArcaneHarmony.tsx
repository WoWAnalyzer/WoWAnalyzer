import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemDamageDone from 'interface/ItemDamageDone';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const DAMAGE_BONUS_PER_STACK = .06;

class ArcaneHarmony extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  }
  protected abilityTracker!: AbilityTracker;

  bonusDamage: number = 0;
  stacks: number = 0
  totalStacks: number = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.ARCANE_HARMONY.bonusID);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE), this.onBarrageCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE), this.onBarrageDamage);
  }

  onBarrageCast(event: CastEvent) {
    const buff = this.selectedCombatant.getBuff(SPELLS.ARCANE_HARMONY_BUFF.id);
    if (buff && buff.stacks) {
      this.stacks = buff.stacks;
    }
  }

  onBarrageDamage(event: DamageEvent) {
    if (this.stacks > 0) {
      this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_BONUS_PER_STACK * this.stacks);
      this.totalStacks += this.stacks;
      this.stacks = 0;
    }
  }

  get averageStacks() {
    return this.totalStacks / this.abilityTracker.getAbility(SPELLS.ARCANE_BARRAGE.id).casts;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_HARMONY}>
          <ItemDamageDone amount={this.bonusDamage} /><br />
          {this.averageStacks.toFixed(2)} <small>Avg. stacks per Barrage</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneHarmony;
