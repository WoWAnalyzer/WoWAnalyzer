import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

/*  Example log:
 *  https://www.warcraftlogs.com/reports/jz4KrnGBmahcfxt9#fight=43&type=summary&source=9
 */

const DAMAGE_BONUS = 0.1;

class FrothingBerserker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  damage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);
  }

  onPlayerDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.FROTHING_BERSERKER.id)) {
      this.damage += calculateEffectiveDamage(event, DAMAGE_BONUS);
    }
  }

  get damagePercent() {
    return this.owner.getPercentageOfTotalDamageDone(this.damage);
  }

  get damageIncreasePercent() {
    return this.damagePercent / (1 - this.damagePercent);
  }

  get uptimePercent() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.FROTHING_BERSERKER.id) / 1000;
    const fightLengthSec = this.owner.fightDuration / 1000;

    return uptime / fightLengthSec;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePercent,
      isLessThan: {
        minor: 0.65,
        average: 0.6,
        major: 0.55,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.FROTHING_BERSERKER.id} /> uptime can be improved.</>)
          .icon(SPELLS.FROTHING_BERSERKER.icon)
          .actual(i18n._(t('warrior.fury.suggestions.frothingBerserker.uptime')`${formatPercentage(actual)}% Frothing Berserker uptime`))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={<>Frothing Berserker contributed to {formatPercentage(this.damagePercent)}% of your overall DPS.</>}
      >
        <BoringSpellValueText spell={SPELLS.FROTHING_BERSERKER_TALENT}>
          <>
            {formatPercentage(this.uptimePercent)}% uptime
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FrothingBerserker;
