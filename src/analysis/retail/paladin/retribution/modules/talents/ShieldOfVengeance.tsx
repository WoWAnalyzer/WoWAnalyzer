import { formatPercentage } from 'common/format';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import StatTracker from 'parser/shared/modules/StatTracker';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_PALADIN } from 'common/TALENTS';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const SHIELD_OF_VENGEANCE_HEALTH_SCALING = 0.3;

class ShieldOfVengeance extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;
  protected healingDone!: HealingDone;

  totalPossibleAbsorb = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.SHIELD_OF_VENGEANCE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PALADIN.SHIELD_OF_VENGEANCE_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (!event.maxHitPoints) {
      return false;
    }
    this.totalPossibleAbsorb +=
      event.maxHitPoints *
      SHIELD_OF_VENGEANCE_HEALTH_SCALING *
      (1 + this.statTracker.currentVersatilityPercentage);
  }

  get pctAbsorbUsed() {
    return (
      this.healingDone.byAbility(TALENTS_PALADIN.SHIELD_OF_VENGEANCE_TALENT.id).effective /
      this.totalPossibleAbsorb
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.pctAbsorbUsed,
      isLessThan: {
        minor: 0.8,
        average: 0.65,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(2)}
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon spell={TALENTS_PALADIN.SHIELD_OF_VENGEANCE_TALENT} />}
        value={`${formatPercentage(this.pctAbsorbUsed)}%`}
        label="Shield of Vengeance Absorb Used"
        tooltip="This does not account for possible absorb from missed Shield of Vengeance casts."
      />
    );
  }
}

export default ShieldOfVengeance;
