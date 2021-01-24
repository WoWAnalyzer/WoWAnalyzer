import React from 'react';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import Combatants from 'parser/shared/modules/Combatants';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, {ApplyBuffEvent, RefreshBuffEvent, CastEvent} from 'parser/core/Events';
import { t } from '@lingui/macro';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

const ART_OF_WAR_DURATION = 10000;

class AoWProcTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  consumedAoWProcs = 0;
  wastedAoWProcs = 0;
  totalAoWProcs = 0;
  lastAoWProcTime: null | number = null;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLADE_OF_WRATH_PROC), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLADE_OF_WRATH_PROC), this.onRefreshBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLADE_OF_JUSTICE), this.onCast);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.totalAoWProcs += 1;
    if (this.spellUsable.isOnCooldown(SPELLS.BLADE_OF_JUSTICE.id)) {
      this.spellUsable.endCooldown(SPELLS.BLADE_OF_JUSTICE.id);
      this.lastAoWProcTime= event.timestamp;
    }
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.wastedAoWProcs += 1;
    this.totalAoWProcs += 1;
  }

  get consumedProcsPercent() {
    return this.consumedAoWProcs / this.totalAoWProcs;
  }

  get suggestionThresholds() {
    return {
      actual: this.consumedProcsPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast(event: CastEvent) {
    if (this.lastAoWProcTime !== event.timestamp) {
      if (this.lastAoWProcTime === null) {
        return;
      }
      const AoWTimeframe = this.lastAoWProcTime + ART_OF_WAR_DURATION;
      if (event.timestamp <= AoWTimeframe) {
        this.consumedAoWProcs += 1;
        this.lastAoWProcTime = null;
      }
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>You used {formatPercentage(this.consumedProcsPercent)}% of your <SpellLink id={SPELLS.ART_OF_WAR.id} icon /> procs.</>)
        .icon(SPELLS.ART_OF_WAR.icon)
        .actual(t({
      id: "paladin.retribution.suggestions.artOfWar.procsUsed",
      message: `${formatPercentage(this.consumedProcsPercent)}% proc(s) used.`
    }))
        .recommended(`Using >${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(2)}
        icon={<SpellIcon id={SPELLS.ART_OF_WAR.id} />}
        value={`${formatPercentage(this.consumedProcsPercent)}%`}
        label="Art of War Procs Used"
        tooltip={`You got ${this.totalAoWProcs} Art of War procs and used ${this.consumedAoWProcs} of them.`}
      />
    );
  }
}

export default AoWProcTracker;
