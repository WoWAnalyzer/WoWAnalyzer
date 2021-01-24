import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, {DamageEvent, } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class Consecration extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  totalHits = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONSECRATION_DAMAGE), this.onConsecrationDamage);
  }

  onConsecrationDamage(event: DamageEvent) {
    this.totalHits += 1;
  }

  get averageHitPerCast() {
    return this.totalHits / this.abilityTracker.getAbility(SPELLS.CONSECRATION_CAST.id).casts;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE()}
        icon={<SpellIcon id={SPELLS.CONSECRATION_CAST.id} />}
        value={`${this.averageHitPerCast.toFixed(2)} hits`}
        label="Targets Hit"
        tooltip={`You averaged ${(this.averageHitPerCast.toFixed(2))} hits per cast of Consecration.`}
      />
    );
  }
}

export default Consecration;
