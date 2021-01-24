import React from 'react';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events, {CastEvent} from 'parser/core/Events';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const SHIELD_OF_VENGEANCE_HEALTH_SCALING = 0.3;

class ShieldOfVengeance extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;
  protected healingDone!: HealingDone;

  totalPossibleAbsorb = 0;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_VENGEANCE), this.onCast);
  }

  onCast(event: CastEvent) {
    if (!event.maxHitPoints) {
      return false;
    }
    this.totalPossibleAbsorb += event.maxHitPoints * SHIELD_OF_VENGEANCE_HEALTH_SCALING * (1+this.statTracker.currentVersatilityPercentage);
  }

  get pctAbsorbUsed() {
    return this.healingDone.byAbility(SPELLS.SHIELD_OF_VENGEANCE.id).effective / this.totalPossibleAbsorb;
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You consumed a low amount of your total <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} /> absorb. It's best used when you can take enough damage to consume most of the absorb. Getting full absorb usage can be difficult on lower difficulty encounters.</>)
        .icon(SPELLS.SHIELD_OF_VENGEANCE.icon)
        .actual(t({
      id: "paladin.retribution.suggestions.shieldOfVengeance.absorbUsed",
      message: `${formatPercentage(actual)}% Shield of Vengeance absorb used`
    }))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(2)}
        icon={<SpellIcon id={SPELLS.SHIELD_OF_VENGEANCE.id} />}
        value={`${formatPercentage(this.pctAbsorbUsed)}%`}
        label="Shield of Vengeance Absorb Used"
        tooltip="This does not account for possible absorb from missed Shield of Vengeance casts."
        />
    );
  }
}

export default ShieldOfVengeance;
