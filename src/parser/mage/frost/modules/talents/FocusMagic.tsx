import React from 'react';

import Analyzer, { Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import UptimeIcon from 'interface/icons/Uptime';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class FocusMagic extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  protected enemies!: EnemyInstances;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FOCUS_MAGIC_TALENT.id);
  }
  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FOCUS_MAGIC_CRIT_BUFF.id) / this.owner.fightDuration;
  }

  get focusMagicBuffUptimeThresholds() {
    return {
      actual: this.buffUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.focusMagicBuffUptimeThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You had low uptime on <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />. In order to get benefit from this talent, ensure that you are putting <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} /> on another player or trading the buff with another mage before the pull. If you buffed a player for the entire fight but still had low uptime, consider giving the buff to a player that will crit more often so the buff can trigger as many times as possible.</>)
          .icon(SPELLS.ICE_LANCE.icon)
          .actual(i18n._(t('mage.frost.suggestions.focusMagic.uptime')`${formatPercentage(this.buffUptime)}% Focus Magic Uptime`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(<>In order for Focus Magic to compete with the other talents on that row, you need to ensure you are getting as much uptime out of the buff as possible. Therefore, if you forget to put the buff on another player or if they player you gave it to is not getting crits very often, then you might need to consider giving the buff to someone else. Ideally, you should aim to trade buffs with another mage who has also taken Focus Magic so you both get the full benefit.</>)}
      >
        <BoringSpellValueText spell={SPELLS.FOCUS_MAGIC_TALENT}>
          <UptimeIcon /> {formatPercentage(this.buffUptime, 0)}% <small>Buff Uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FocusMagic;
