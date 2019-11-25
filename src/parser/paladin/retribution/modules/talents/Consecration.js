import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class Consecration extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  wasteHP = false;
  totalHits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CONSECRATION_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONSECRATION_TALENT), this.onConsecrationCast);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.CONSECRATION_TALENT), this.onConsecrationEnergize);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONSECRATION_DAMAGE), this.onConsecrationDamage);
  }

  onConsecrationEnergize(event) {
    if (event.waste > 0) {
      this.wasteHP = true;
    }
  }

  onConsecrationCast(event) {
    if (this.wasteHP) {
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = 'Consecration was cast while at max Holy Power. Make sure to use a Holy Power spender first to avoid overcapping.';
      this.wasteHP = false;
    }
  }

  onConsecrationDamage(event) {
    this.totalHits += 1;
  }

  get averageHitPerCast() {
    return this.totalHits / this.abilityTracker.getAbility(SPELLS.CONSECRATION_TALENT.id).casts;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.UNIMPORTANT()}
        icon={<SpellIcon id={SPELLS.CONSECRATION_TALENT.id} />}
        value={`${this.averageHitPerCast.toFixed(2)} hits`}
        label="Targets Hit"
        tooltip={`You averaged ${(this.averageHitPerCast.toFixed(2))} hits per cast of Consecration.`}
      />
    );
  }
}

export default Consecration;
