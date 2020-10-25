import React from 'react';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import { formatPercentage } from 'common/format';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SpellIcon from 'common/SpellIcon';

class GuileCharm extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  deepInsightUptime: number = 0;
  moderateInsightUptime: number = 0;
  shallowInsightUptime: number = 0;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.GUILE_CHARM.bonusID);
  }

  get percentUptime() {
    this.shallowInsightUptime = this.selectedCombatant.getBuffUptime(SPELLS.SHALLOW_INSIGHT_BUFF.id) / this.owner.fightDuration;
    this.moderateInsightUptime = this.selectedCombatant.getBuffUptime(SPELLS.MODERATE_INSIGHT_BUFF.id) / this.owner.fightDuration;
    this.deepInsightUptime = this.selectedCombatant.getBuffUptime(SPELLS.DEEP_INSIGHT_BUFF.id) / this.owner.fightDuration;
    return {
      shallowInsight: this.shallowInsightUptime,
      moderateInsight: this.moderateInsightUptime,
      deepInsight: this.deepInsightUptime,
    };
  }

  statistic() {
    return (
      <Statistic size="flexible" tooltip="This measures how long each buff from this legendary is active.">
        <BoringSpellValueText spell={SPELLS.GUILE_CHARM}>
          <SpellIcon id={SPELLS.SHALLOW_INSIGHT_BUFF.id} /> {formatPercentage(this.percentUptime.shallowInsight)}% <small>Shallow Insight uptime</small><br />
          <SpellIcon id={SPELLS.MODERATE_INSIGHT_BUFF.id} /> {formatPercentage(this.percentUptime.moderateInsight)}% <small>Moderate Insight uptime</small><br />
          <SpellIcon id={SPELLS.DEEP_INSIGHT_BUFF.id} /> {formatPercentage(this.percentUptime.deepInsight)}% <small>Deep Insight uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GuileCharm;