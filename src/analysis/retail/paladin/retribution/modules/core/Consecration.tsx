import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class Consecration extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  totalHits = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CONSECRATION_DAMAGE),
      this.onConsecrationDamage,
    );
  }

  onConsecrationDamage(event: DamageEvent) {
    this.totalHits += 1;
  }

  get averageHitPerCast() {
    const casts = this.abilityTracker.getAbility(SPELLS.CONSECRATION_CAST.id).casts;

    return this.totalHits / casts;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE()}
        icon={<SpellIcon spell={SPELLS.CONSECRATION_CAST} />}
        value={`${this.averageHitPerCast.toFixed(2)} hits`}
        label="Targets Hit"
        tooltip={`You averaged ${this.averageHitPerCast.toFixed(2)} hits per cast of Consecration.`}
      />
    );
  }
}

export default Consecration;
