import { When, ThresholdStyle } from 'parser/core/ParseResults';
import ManaValues from 'parser/shared/modules/ManaValues';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import { formatPercentage, formatNumber } from 'common/format';
import { Options } from 'parser/core/Analyzer';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import Events from 'parser/core/Events';

class ArcaneManaValues extends ManaValues {
  static dependencies = {
		deathTracker: DeathTracker,
  };
  protected deathTracker!: DeathTracker;

  constructor(options: Options) {
    super(options);
      this.active = true;
      this.addEventListener(Events.fightend, this.onFightend);
  }

  deadOnKill = false;

  onFightend() {
    if (!this.deathTracker.isAlive) {
      this.deadOnKill = true;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.manaLeftPercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.3,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    if (!this.deadOnKill) {
      when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest('You had mana left at the end of the fight. You should be aiming to complete the fight with as little mana as possible regardless of whether your cooldowns will be coming up or not. So dont be afraid to burn your mana before the boss dies.')
          .icon('inv_elemental_mote_mana')
          .actual(`${formatPercentage(actual)}% (${formatNumber(this.endingMana)}) ${i18n._(t('mage.arcane.suggestions.arcaneMana.manaLeft')`mana left`)}`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.isGreaterThan.average)
          .major(this.suggestionThresholds.isGreaterThan.major));
    }
  }
}

export default ArcaneManaValues;
