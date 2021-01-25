import React from 'react';
import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import BoringValueText from 'parser/ui/BoringValueText';

class RuptureUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get percentUptime() {
    return this.enemies.getBuffUptime(SPELLS.RUPTURE.id) / this.owner.fightDuration;
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
    when(this.suggestionThresholds).addSuggestion((suggest: SuggestionFactory, actual: number | boolean, recommended: number | boolean) => suggest(<>Your <SpellLink id={SPELLS.RUPTURE.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.RUPTURE.id} /> on the boss.</>)
        .icon(SPELLS.RUPTURE.icon)
        .actual(t({
          id: 'rogue.assassination.suggestions.rupture.uptime',
          message: `${formatPercentage(actual as number)}% Rupture uptime`
        }))
        .recommended(`>${formatPercentage(recommended as number)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringValueText label={<><SpellIcon id={SPELLS.RUPTURE.id} /> Rupture Uptime</>}>
          {formatPercentage(this.percentUptime)}%
        </BoringValueText>
      </Statistic>
    );
  }

}

export default RuptureUptime;
