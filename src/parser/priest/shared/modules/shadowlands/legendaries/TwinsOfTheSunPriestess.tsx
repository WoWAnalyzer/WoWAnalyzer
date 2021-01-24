import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import { formatNumber } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import { t } from '@lingui/macro';

class TwinsOfTheSunPriestess extends Analyzer {

  // More could probably be done with this to analyze what the person you used it on did.
  // this is at least a base of making sure they're using PI on other players and not wasting it on themself.

  goodCasts = 0;
  badCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.TWINS_OF_THE_SUN_PRIESTESS.bonusID);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_INFUSION), this.onCast);
  }

  get totalCasts() {
    return this.badCasts + this.goodCasts;
  }

  onCast(event: CastEvent) {
    if (event.targetID === event.sourceID) {
      this.badCasts += 1;
    } else {
      this.goodCasts += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    const castsPlural = this.badCasts === 1 ? 'cast' : 'casts';
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You had {this.badCasts} bad {castsPlural} of <SpellLink id={SPELLS.POWER_INFUSION.id} /> by using it on yourself. When taking this legendary, make sure to always use it on an ally. By using it on yourself, you lose out on a free <SpellLink id={SPELLS.POWER_INFUSION.id} /> for a raid member.</>)
      .icon(SPELLS.TWINS_OF_THE_SUN_PRIESTESS.icon)
      .actual(
        t({
          id:'priest.shared.legendaries.twinsOfTheSunPriestess.efficiency',
          message: `You had ${this.badCasts} ${castsPlural} of Power Infusion on yourself.`
        })
      )
      .recommended(`No casts on yourself is recommended.`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.TWINS_OF_THE_SUN_PRIESTESS}>
          {formatNumber(this.goodCasts)}/{formatNumber(this.totalCasts)} Uses
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TwinsOfTheSunPriestess;
