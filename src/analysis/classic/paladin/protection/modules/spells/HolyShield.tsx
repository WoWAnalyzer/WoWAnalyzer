import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS/classic/paladin';

class HolyShield extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healing = 0;
  buffHealing = 0;
  category = STATISTIC_CATEGORY.TALENTS;
  prepullApplication = false;

  constructor(options: Options) {
    super(options);
    this.active = true;

    this.category = STATISTIC_CATEGORY.GENERAL;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell({ id: SPELLS.HOLY_SHIELD.id }),
      this.holyShieldPrepullCheck,
    );
  }

  holyShieldPrepullCheck(event: ApplyBuffEvent) {
    if (event.prepull) {
      this.prepullApplication = true;
    }
  }

  get uptime() {
    return Object.values(this.combatants.players).reduce(
      (uptime, player) => uptime + player.getBuffUptime(SPELLS.HOLY_SHIELD.id, this.owner.playerId),
      0,
    );
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsPrepull() {
    return {
      actual: this.prepullApplication,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }
}

export default HolyShield;
