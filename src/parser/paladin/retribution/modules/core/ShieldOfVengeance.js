import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatTracker from 'parser/shared/modules/StatTracker';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const SHIELD_OF_VENGEANCE_HEALTH_SCALING = 0.3;

class ShieldOfVengeance extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
    statTracker: StatTracker,
  };
  totalPossibleAbsorb = 0;

  constructor(options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_VENGEANCE), this.onCast);
  }

  onCast(event) {
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
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You consumed a low amount of your total <SpellLink id={SPELLS.SHIELD_OF_VENGEANCE.id} /> absorb. It's best used when you can take enough damage to consume most of the absorb. Getting full absorb usage can be difficult on lower difficulty encounters.</>)
        .icon(SPELLS.SHIELD_OF_VENGEANCE.icon)
        .actual(i18n._(t('paladin.retribution.suggestions.shieldOfVengeance.absorbUsed')`${formatPercentage(actual)}% Shield of Vengeance absorb used`))
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
