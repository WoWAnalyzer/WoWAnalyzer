import React from 'react';

import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { t } from '@lingui/macro';

import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';

class StellarFlareUptime extends Analyzer {
  get suggestionThresholds() {
    const stellarFlareUptime = this.enemies.getBuffUptime(SPELLS.STELLAR_FLARE_TALENT.id) / this.owner.fightDuration;
    return {
      actual: stellarFlareUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.STELLAR_FLARE_TALENT.id} /> uptime can be improved. Try to pay more attention to your Stellar Flare on the boss.</>)
      .icon(SPELLS.STELLAR_FLARE_TALENT.icon)
      .actual(t({
      id: "druid.balance.suggestions.stellarFlare.uptime",
      message: `${formatPercentage(actual)}% Stellar Flare uptime`
    }))
      .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    const stellarFlareUptime = this.enemies.getBuffUptime(SPELLS.STELLAR_FLARE_TALENT.id) / this.owner.fightDuration;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.STELLAR_FLARE_TALENT}>
          <>
            <UptimeIcon /> {formatPercentage(stellarFlareUptime)} % <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default StellarFlareUptime;
