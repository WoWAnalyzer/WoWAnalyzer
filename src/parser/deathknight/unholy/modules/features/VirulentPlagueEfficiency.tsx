import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, CastEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';

class VirulentPlagueEfficiency extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE), this.onRefresh);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE), this.onApply);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.OUTBREAK), this.onCastOutbreak);
  }

  targets: { [key: string]: number } = {};

  totalOutBreakCasts = 0;
  totalTimeWasted = 0;
  protected enemies!: Enemies;

  get Uptime() {
    return this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;
  }

  get UptimeSuggestionThresholds() {
    return {
      actual: this.Uptime,
      isLessThan: {
        minor: 0.92,
        average: 0.84,
        major: .74,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get VirulentDuration() {
    return this.selectedCombatant.hasTalent(SPELLS.EBON_FEVER_TALENT.id) ? 13.65 : 27.3;
  }

  onRefresh(event: RefreshDebuffEvent) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + 1000 * this.VirulentDuration;
  }

  onApply(event: ApplyDebuffEvent) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] = event.timestamp + 1000 * this.VirulentDuration - 1000 * 0.3 * this.VirulentDuration;
    //Removing 3.15 seconds when buff is only applied. This is for cases when the target does not benefit from the epidemic effect (Dots spreading to adds not staying by target for instance.)
  }

  onCastOutbreak(event: CastEvent) {
    this.totalOutBreakCasts += 1;
    if (this.targets[encodeTargetString(event.targetID, event.targetInstance)]) {
      //We subtract 6 seconds from the total duration since this is the time left after Outbreak finishes.
      if (((this.targets[encodeTargetString(event.targetID, event.targetInstance)]) - event.timestamp) >= 0) {
        this.totalTimeWasted += ((this.targets[encodeTargetString(event.targetID, event.targetInstance)]) - event.timestamp) / 1000;
      }
    }
  }

  get averageTimeWasted() {
    return this.totalOutBreakCasts !== 0 ? (this.totalTimeWasted / this.totalOutBreakCasts) : 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageTimeWasted,
      isGreaterThan: {
        minor: 1,
        average: 3,
        major: 5,
      },
      style: ThresholdStyle.NUMBER,
      suffix: 'Average',
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<> You are casting <SpellLink id={SPELLS.VIRULENT_PLAGUE.id} /> too often. Try to cast <SpellLink id={SPELLS.VIRULENT_PLAGUE.id} /> as close to it falling off as possible.</>)
          .icon(SPELLS.VIRULENT_PLAGUE.icon)
          .actual(t({
      id: "deathknight.unholy.suggestions.virulentPlague.efficiency",
      message: `${(this.averageTimeWasted).toFixed(1)} seconds of Virulent Plague uptime was wasted on average for each cast of Outbreak`
    }))
          .recommended(`<${recommended} is recommended`));
    when(this.UptimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.VIRULENT_PLAGUE.id} /> uptime can be improved. Try to pay attention to when Virulent Plague is about to fall off the priority target, using <SpellLink id={SPELLS.OUTBREAK.id} /> to refresh Virulent Plague. Using a debuff tracker can help.</span>)
        .icon(SPELLS.VIRULENT_PLAGUE.icon)
        .actual(t({
      id: "deathknight.unholy.suggestions.virulentPlague.uptime",
      message: `${formatPercentage(actual)}% Virulent Plague uptime`
    }))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        tooltip={`A total amount of ${this.totalTimeWasted.toFixed(1)} seconds of Virulent Plague uptime was wasted with an average amount of ${(this.averageTimeWasted).toFixed(1)} seconds per cast`}
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.VIRULENT_PLAGUE}>
          <>
            <UptimeIcon /> {formatPercentage(this.Uptime)}% <small>uptime</small><br/>
            {(this.averageTimeWasted).toFixed(1)}s <small>average duration wasted</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VirulentPlagueEfficiency;
