import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
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

  buffStack = 0;
  highStackTimestamp = 0;
  intUptime = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FOCUS_MAGIC_TALENT.id);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.FOCUS_MAGIC_CRIT_BUFF), this.onBuffApplied);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.FOCUS_MAGIC_CRIT_BUFF), this.onBuffRefreshed);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.FOCUS_MAGIC_CRIT_BUFF), this.onBuffRemoved);
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.buffStack = 1;
  }

  onBuffRefreshed(event: RefreshBuffEvent) {
    this.buffStack += 1;

    if (this.buffStack >= 8 && this.highStackTimestamp === 0) {
      this.highStackTimestamp = event.timestamp;
    }
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    this.buffStack = 0;

    if (this.highStackTimestamp !== 0) {
      this.intUptime += event.timestamp - this.highStackTimestamp;
      this.highStackTimestamp = 0;
    }
  }

  get intBuffUptime() {
    return this.intUptime / this.owner.fightDuration;
  }

  get critBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FOCUS_MAGIC_CRIT_BUFF.id) / this.owner.fightDuration;
  }

  get focusMagicBuffUptimeThresholds() {
    return {
      actual: this.critBuffUptime,
      isLessThan: {
        minor: 1,
        average: 0.90,
        major: 0.80,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.focusMagicBuffUptimeThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You had low uptime on <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} />. In order to get benefit from this talent, ensure that you are putting <SpellLink id={SPELLS.FOCUS_MAGIC_TALENT.id} /> on another player or trading the buff with another mage before the pull. If you buffed a player for the entire fight but still had low uptime, consider giving the buff to a player that will crit with direct damage (Non DoT) abilities more often so the buff can trigger as many times as possible.</>)
          .icon(SPELLS.FOCUS_MAGIC_TALENT.icon)
          .actual(i18n._(t('mage.shared.suggestions.focusMagic.uptime')`${formatPercentage(this.critBuffUptime)}% Focus Magic Uptime`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={(
          <>
            In order for Focus Magic to compete with the other talents on that row, you need to ensure you are getting as much uptime out of the buff as possible. Therefore, if you forget to put the buff on another player or if the player you gave it to is not getting direct damage crits very often (DoT crits do not count), then you might need to consider giving the buff to someone else. Ideally, you should aim to trade buffs with another mage who has also taken Focus Magic so you both can benefit.<br /><br />

            In addition to giving you crit for 10 seconds when your partner crits, the buff also applies a stacking Intellect buff to you every time the crit buff is refreshed. So making sure that your partner is getting as many crits as possible so you can spend as much time at 8 stacks of the Intellect buff as possible should be your priority with this talent.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.FOCUS_MAGIC_TALENT}>
          <UptimeIcon /> {formatPercentage(this.critBuffUptime, 0)}% <small>Crit Buff Uptime</small><br />
          <UptimeIcon /> {formatPercentage(this.intBuffUptime, 0)}% <small>Int Buff Uptime (At 8 Stacks)</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FocusMagic;
