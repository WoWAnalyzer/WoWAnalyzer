import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
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
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_BARRAGE),
      this.onBarrageCast,
    );
  }

  conservedTooHigh = 0;

  onBarrageCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ARCANE_BARRAGE.id) {
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
      1 - this.conservedTooHigh / this.abilityTracker.getAbility(SPELLS.ARCANE_BARRAGE.id).casts
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
          You cast <SpellLink spell={SPELLS.ARCANE_BARRAGE} /> with greater than 70% mana{' '}
          {this.conservedTooHigh} times. Because of the way{' '}
          <SpellLink spell={TALENTS.TIME_ANOMALY_TALENT} /> works, you can randomly gain the{' '}
          <SpellLink spell={TALENTS.EVOCATION_TALENT} /> effect causing your mana to rapidly
          increase. If you are conserving your mana too high, this can cause your mana to cap out at
          100% which is a waste. So if you are using the Time Anomaly talent, you should make sure
          you conserve below 70% mana to help prevent mana capping.
        </>,
      )
        .icon(TALENTS.TIME_ANOMALY_TALENT.icon)
        .actual(`${formatPercentage(this.manaUtilization)}% Utilization`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default TimeAnomaly;
