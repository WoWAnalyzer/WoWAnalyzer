import { t, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

// 50 was too low, 100 was too high
// had no issues with 85ms
const BUFFER_MS = 85;

interface HealingRainTickInfo {
  timestamp: number;
  hits: number;
}

class HealingRain extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healingRainTicks: HealingRainTickInfo[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_HEAL),
      this.onHealingRainHeal,
    );
  }

  get averageHitsPerTick() {
    const totalHits = this.healingRainTicks.reduce((total, tick) => total + tick.hits, 0);
    return totalHits / this.healingRainTicks.length;
  }

  suggestions(when: When) {
    const suggestionThreshold = this.suggestionThreshold;
    when(suggestionThreshold.actual)
      .isLessThan(suggestionThreshold.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            Try to always cast <SpellLink id={TALENTS.HEALING_RAIN_TALENT.id} /> in areas where
            players stack. This allows the spell to consitantly hit all 6 possible targets.
          </span>,
        )
          .icon(TALENTS.HEALING_RAIN_TALENT.icon)
          .actual(
            t({
              id: 'shaman.restoration.suggestions.healingRain.averageTargets',
              message: `${suggestionThreshold.actual.toFixed(2)} average targets healed`,
            }),
          )
          .recommended(`${suggestionThreshold.isLessThan.minor} average targets healed`)
          .regular(suggestionThreshold.isLessThan.average)
          .major(suggestionThreshold.isLessThan.average),
      );
  }

  get suggestionThreshold() {
    return {
      actual: this.averageHitsPerTick,
      isLessThan: {
        minor: 5,
        average: 3,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onHealingRainHeal(event: HealEvent) {
    // Filter out pets, but only if it fully overhealed as Rain will prioritize injured pets over non-injured players
    // fully overhealing guarantees that there are not enough players in the healing rain
    const combatant = this.combatants.getEntity(event);
    if (!combatant && event.overheal && event.amount === 0) {
      return;
    }

    const healingRainTick = this.healingRainTicks.find(
      (tick) => event.timestamp - BUFFER_MS <= tick.timestamp,
    );
    if (!healingRainTick) {
      this.healingRainTicks.push({
        timestamp: event.timestamp,
        hits: 1,
      });
    } else {
      // dirty fix for partial ticks happening at the same time as a real tick
      healingRainTick.hits =
        healingRainTick.hits + 1 > 6 ? (healingRainTick.hits = 6) : healingRainTick.hits + 1;
    }
  }

  statistic() {
    if (isNaN(this.averageHitsPerTick)) {
      return false;
    }

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HEALING_RAIN_HEAL.id} />}
        value={`${this.averageHitsPerTick.toFixed(2)}`}
        position={STATISTIC_ORDER.OPTIONAL()}
        label={
          <TooltipElement
            content={
              <Trans id="shaman.restoration.healingRain.averageTargets.label.tooltip">
                The average number of targets healed by Healing Rain out of the maximum amount of 6
                targets.
              </Trans>
            }
          >
            <Trans id="shaman.restoration.healingRain.averageTargets.label">
              Average Healing Rain Targets
            </Trans>
          </TooltipElement>
        }
      />
    );
  }
}

export default HealingRain;
