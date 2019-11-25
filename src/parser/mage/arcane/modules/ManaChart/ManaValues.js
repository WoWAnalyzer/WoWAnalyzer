import ManaValues from 'parser/shared/modules/ManaValues';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import { formatPercentage, formatNumber } from 'common/format';

class ArcaneManaValues extends ManaValues {
  static dependencies = {
		deathTracker: DeathTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = true;
  }

  deadOnKill = false;

  on_fightend() {
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
      style: 'percentage',
    };
  }

  suggestions(when) {
    if (!this.deadOnKill) {
      when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You had mana left at the end of the fight. You should be aiming to complete the fight with as little mana as possible regardless of whether your cooldowns will be coming up or not. So dont be afraid to burn your mana before the boss dies.')
          .icon('inv_elemental_mote_mana')
          .actual(`${formatPercentage(actual)}% (${formatNumber(this.endingMana)}) mana left`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.isGreaterThan.average)
          .major(this.suggestionThresholds.isGreaterThan.major);
      });
    }
  }
}

export default ArcaneManaValues;
