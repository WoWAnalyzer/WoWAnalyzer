import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class HealingPerHolyPower extends Analyzer {
  totalEffectiveHealing = 0;
  totalSpenders = 0;
  activeBarriers: Array<{ target: number; timestamp: number }> = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.SHOCK_BARRIER_ITEM);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN),
      this.castSpender,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WORD_OF_GLORY),
      this.castSpender,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN),
      this.healEvent,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.WORD_OF_GLORY),
      this.healEvent,
    );
  }

  castSpender(event: CastEvent) {
    this.totalSpenders += 1;
  }

  healEvent(event: HealEvent) {
    this.totalEffectiveHealing += event.amount + (event.absorbed || 0); // effective healing by default does not include healing done to healing absorbs, even though that is effective healing
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            Total healing by spenders, divided by total number of holy power spent on those spenders
          </>
        }
      >
        <div className="pad">
          <label>Healing per Holy Power</label>
          <div className="value">{this.totalEffectiveHealing / this.totalSpenders / 3}</div>
        </div>
      </Statistic>
    );
  }
}

export default HealingPerHolyPower;
