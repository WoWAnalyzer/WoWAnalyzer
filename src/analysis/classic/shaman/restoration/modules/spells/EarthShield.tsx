import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValue from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import SPELLS from 'common/SPELLS/classic/shaman';

class EarthShield extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healing = 0;
  prepullApplication = false;

  constructor(options: Options) {
    super(options);

    this.active = true;

    // event listener for direct heals when taking damage with earth shield
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell({ id: SPELLS.EARTH_SHIELD_HEAL.id }),
      this.onEarthShieldHeal,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell({ id: SPELLS.EARTH_SHIELD.id }),
      this.earthShieldPrepullCheck,
    );
  }

  earthShieldPrepullCheck(evt: ApplyBuffEvent) {
    if (evt.prepull) {
      this.prepullApplication = true;
    }
  }

  // TODO: Fix earth shield reporting as over 100%

  get uptime() {
    return Object.values(this.combatants.players).reduce(
      (uptime, player) =>
        uptime + player.getBuffUptime(SPELLS.EARTH_SHIELD.id, this.owner.playerId),
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

  onEarthShieldHeal(event: HealEvent) {
    this.healing += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(45)}
      >
        <BoringValue label={<SpellLink id={SPELLS.EARTH_SHIELD.id} />}>
          <div>
            <UptimeIcon /> {formatPercentage(this.uptimePercent)}% <small>uptime</small>
            <br />
            <ItemHealingDone amount={this.healing} />
          </div>
        </BoringValue>
      </Statistic>
    );
  }
}

export default EarthShield;
