import React from 'react';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import UptimeIcon from 'interface/icons/Uptime';
import Statistic from 'interface/statistics/Statistic';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import BoringValue from 'interface/statistics/components/BoringValueText';

import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class Lifebloom extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  hasDTL = false;

  constructor(options: Options) {
    super(options);
    this.hasDTL = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.LIFEBLOOM_DTL_HOT_HEAL.bonusID);
  }

  get uptime() {
    // Only either LIFEBLOOM_HOT_HEAL or LIFEBLOOM_DTL_HOT_HEAL can be up (with or without the DTL legendary), but
    // DTL Lifeblooms (LIFEBLOOM_DTL_HOT_HEAL) are on two targets so their BuffUptime need to behalved for a percentage
    return this.combatants.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id)
      + this.combatants.getBuffUptime(SPELLS.LIFEBLOOM_DTL_HOT_HEAL.id);
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  // "The Dark Titan's Advice" legendary buffs Lifebloom, making high uptime more important
  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.80,
        average: 0.60,
        major: 0.40,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> uptime can be improved. {this.hasDTL ? <>High uptime is particularly important for taking advantage of your equipped <SpellLink id={SPELLS.THE_DARK_TITANS_LESSON.id} /></> : ''}</>)
        .icon(SPELLS.LIFEBLOOM_HOT_HEAL.icon)
        .actual(t({
          id: "druid.restoration.suggestions.lifebloom.uptime",
          message: `${formatPercentage(this.uptimePercent)}% uptime`
        }))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(10)}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> Lifebloom Uptime</>}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptimePercent)} %
          </>
        </BoringValue>
      </Statistic>
    );
  }
}

export default Lifebloom;
