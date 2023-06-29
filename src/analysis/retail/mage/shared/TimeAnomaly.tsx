import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const MANA_THRESHOLD = 0.7;

class TimeAnomaly extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TIME_ANOMALY_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ARCANE_BARRAGE_TALENT),
      this.onBarrageCast,
    );
  }

  conservedTooHigh = 0;

  onBarrageCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== TALENTS.ARCANE_BARRAGE_TALENT.id) {
      return;
    }
    const manaResource: any =
      event.classResources &&
      event.classResources.find((classResource) => classResource.type === RESOURCE_TYPES.MANA.id);
    const manaPercent = manaResource.amount / manaResource.max;
    if (manaPercent > MANA_THRESHOLD) {
      this.conservedTooHigh += 1;
    }
  }

  get manaUtilization() {
    return (
      1 -
      this.conservedTooHigh / this.abilityTracker.getAbility(TALENTS.ARCANE_BARRAGE_TALENT.id).casts
    );
  }

  get timeAnomalyManaThresholds() {
    return {
      actual: this.manaUtilization,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.timeAnomalyManaThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.ARCANE_BARRAGE_TALENT.id} /> with greater than 70% mana{' '}
          {this.conservedTooHigh} times. Because of the way{' '}
          <SpellLink id={TALENTS.TIME_ANOMALY_TALENT.id} /> works, you can randomly gain the{' '}
          <SpellLink id={TALENTS.EVOCATION_TALENT.id} /> effect causing your mana to rapidly
          increase. If you are conserving your mana too high, this can cause your mana to cap out at
          100% which is a waste. So if you are using the Time Anomaly talent, you should make sure
          you conserve below 70% mana to help prevent mana capping.
        </>,
      )
        .icon(TALENTS.TIME_ANOMALY_TALENT.icon)
        .actual(<>{formatPercentage(this.manaUtilization)}% Utilization</>)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default TimeAnomaly;
