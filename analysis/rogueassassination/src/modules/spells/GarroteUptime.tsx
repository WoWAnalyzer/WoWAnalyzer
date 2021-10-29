import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink, SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

class GarroteUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get percentUptime() {
    return this.enemies.getBuffUptime(SPELLS.GARROTE.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion(
      (suggest: SuggestionFactory, actual: number | boolean, recommended: number | boolean) =>
        suggest(
          <>
            Your <SpellLink id={SPELLS.GARROTE.id} /> uptime can be improved. Try to pay more
            attention to your <SpellLink id={SPELLS.GARROTE.id} /> on the boss.
          </>,
        )
          .icon(SPELLS.GARROTE.icon)
          .actual(
            t({
              id: 'rogue.assassination.suggestions.garrote.uptime',
              message: `${formatPercentage(actual as number)}% Garrote uptime`,
            }),
          )
          .recommended(`>${formatPercentage(recommended as number)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.GARROTE.id} /> Garrote Uptime
            </>
          }
        >
          {formatPercentage(this.percentUptime)}%
        </BoringValueText>
      </Statistic>
    );
  }
}

export default GarroteUptime;
