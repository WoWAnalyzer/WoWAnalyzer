import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

const TOUCH_OF_KARMA_HP_SCALING = 0.5;

class TouchOfKarma extends Analyzer {
	static dependencies = {
    healingDone: HealingDone,
  };
  totalPossibleAbsorb = 0;

  constructor(options){
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.TOUCH_OF_KARMA_CAST), this.onCast);
  }

  onCast(event) {
    this.totalPossibleAbsorb += event.maxHitPoints * TOUCH_OF_KARMA_HP_SCALING;
  }

  get absorbUsed() {
    return this.healingDone.byAbility(SPELLS.TOUCH_OF_KARMA_CAST.id).effective / this.totalPossibleAbsorb;
  }

  get suggestionThresholds() {
    return {
      actual: this.absorbUsed,
      isLessThan: {
        minor: 0.8,
        average: 0.65,
        major: 0.5,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<> You consumed a low amount of your total <SpellLink id={SPELLS.TOUCH_OF_KARMA_CAST.id} /> absorb. It's best used when you can take enough damage to consume most of the absorb. Getting full absorb usage shouldn't be expected on lower difficulty encounters </>)
        .icon(SPELLS.TOUCH_OF_KARMA_CAST.icon)
        .actual(i18n._(t('monk.windwalker.suggestions.touchOfKarma.absorbUsed')`${formatPercentage(actual)}% Touch of Karma absorb used`))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        tooltip="This does not account for possible absorbs from missed Touch of Karma casts"
      >
      <BoringSpellValueText spell={SPELLS.TOUCH_OF_KARMA_CAST}>
        {formatPercentage(this.absorbUsed, 0)}% <small>Absorb used</small>
      </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TouchOfKarma;
