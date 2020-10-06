import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Statistic from 'interface/statistics/Statistic';
import { formatPercentage } from 'common/format';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import SpellLink from 'common/SpellLink';

class GuileCharm extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  deepInsightUptime: number = 0;
  moderateInsightUptime: number = 0;
  shallowInsightUptime: number = 0;
  protected abilities!: Abilities;

  constructor(options: any) {
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
      <>
        <Statistic size="flexible" tooltip="This measures how long each buff from this legendary is active.">
          <div className="pad">
            <label><SpellLink id={SPELLS.GUILE_CHARM.id} /> Insight Uptime</label>
          </div>
          <BoringSpellValue spell={SPELLS.SHALLOW_INSIGHT_BUFF} label={''} value={`${formatPercentage(this.percentUptime.shallowInsight)}%`} />
          <BoringSpellValue spell={SPELLS.MODERATE_INSIGHT_BUFF} label={''} value={`${formatPercentage(this.percentUptime.moderateInsight)}%`} />
          <BoringSpellValue spell={SPELLS.DEEP_INSIGHT_BUFF} label={''} value={`${formatPercentage(this.percentUptime.deepInsight)}%`} />
        </Statistic>
      </>
    );
  }
}

export default GuileCharm;