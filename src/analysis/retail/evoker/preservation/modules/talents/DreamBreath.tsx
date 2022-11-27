import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Events, { HealEvent } from 'parser/core/Events';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import { SpellLink } from 'interface';

class DreamBreath extends Analyzer {
  get calculateHotOverHealing() {
    return formatPercentage(
      this.breathHotOverHealing / (this.breathHotHealing + this.breathHotOverHealing),
    );
  }

  get calculateHitOverHealing() {
    return formatPercentage(this.breathOverhealing / (this.breathHealing + this.breathOverhealing));
  }

  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  breathHealing: number = 0;
  breathOverhealing: number = 0;
  breathHotHealing: number = 0;
  breathHotOverHealing: number = 0;

  totalHealing: number = 0;
  totalOverhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.DREAM_BREATH, SPELLS.DREAM_BREATH_ECHO]),
      this.onHeal,
    );
  }

  onHeal(event: HealEvent) {
    if (event.tick) {
      this.breathHotHealing += event.amount + (event.absorbed || 0);
      this.breathHotOverHealing += event.overheal || 0;
    } else {
      this.breathHealing += event.amount + (event.absorbed || 0);
      this.breathOverhealing += event.overheal || 0;
    }
    // total healing
    this.totalHealing += event.amount + (event.absorbed || 0);
    this.totalOverhealing += event.overheal || 0;
  }

  get overhealPercent() {
    return this.totalOverhealing / (this.totalHealing + this.totalOverhealing);
  }

  get suggestionThresholds() {
    return {
      actual: this.overhealPercent,
      isGreaterThan: {
        minor: 35,
        average: 40,
        major: 50,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.DREAM_BREATH.id} /> is creating a large amount of overheal.
        </>,
      )
        .icon(SPELLS.DREAM_BREATH.icon)
        .actual(
          `${formatPercentage(this.totalOverhealing, 2)} + ' '${t({
            id: 'evoker.preservation.suggestions.dreamBreath.totalOverhealing',
            message: ` Dream Breath overhealing`,
          })}`,
        )
        .recommended(`${recommended} overheal or less recommended`),
    );
  }
}

export default DreamBreath;
