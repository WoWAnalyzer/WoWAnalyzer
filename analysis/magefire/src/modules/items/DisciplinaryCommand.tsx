import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { ApplyBuffEvent, RemoveBuffEvent, FightEndEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

class DisciplinaryCommand extends Analyzer {
  combustionStartTimestamp = 0;
  disciplinaryCommandStartTimestamp = 0;
  disciplinaryCommandEndTimestamp = 0;
  disciplinaryCommandUptime = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.DISCIPLINARY_COMMAND.bonusID);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
      this.onCombustionStart,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COMBUSTION),
      this.onCombustionEnd,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DISCIPLINARY_COMMAND_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DISCIPLINARY_COMMAND_BUFF),
      this.onBuffRemoved,
    );
    this.addEventListener(Events.fightend, this.onFinished);
  }

  onCombustionStart(event: ApplyBuffEvent) {
    this.combustionStartTimestamp = event.timestamp;
    if (this.selectedCombatant.hasBuff(SPELLS.DISCIPLINARY_COMMAND_BUFF.id)) {
      this.disciplinaryCommandStartTimestamp = event.timestamp;
    }
  }

  onCombustionEnd(event: RemoveBuffEvent) {
    if (this.disciplinaryCommandStartTimestamp === 0 && this.combustionStartTimestamp !== 0) {
      return;
    }

    const buffApplied = this.selectedCombatant.hasBuff(SPELLS.DISCIPLINARY_COMMAND_BUFF.id);
    this.disciplinaryCommandUptime += buffApplied
      ? event.timestamp - (this.disciplinaryCommandStartTimestamp || 0)
      : this.disciplinaryCommandEndTimestamp - this.combustionStartTimestamp;

    this.combustionStartTimestamp = 0;
    this.disciplinaryCommandStartTimestamp = 0;
    this.disciplinaryCommandEndTimestamp = 0;
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this.disciplinaryCommandStartTimestamp = event.timestamp;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id)) {
      this.disciplinaryCommandEndTimestamp = event.timestamp;
    } else {
      this.disciplinaryCommandStartTimestamp = 0;
      this.disciplinaryCommandEndTimestamp = 0;
    }
  }

  onFinished(event: FightEndEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.COMBUSTION.id)) {
      return;
    }
    const buffApplied = this.selectedCombatant.hasBuff(SPELLS.DISCIPLINARY_COMMAND_BUFF.id);
    this.disciplinaryCommandUptime += buffApplied
      ? event.timestamp - this.disciplinaryCommandStartTimestamp
      : this.combustionStartTimestamp - this.disciplinaryCommandEndTimestamp;
  }

  get percentUptimeDuringCombustion() {
    return (
      this.disciplinaryCommandUptime / this.selectedCombatant.getBuffUptime(SPELLS.COMBUSTION.id)
    );
  }

  get disciplinaryCommandUptimeThresholds() {
    return {
      actual: this.percentUptimeDuringCombustion,
      isLessThan: {
        average: 1,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.disciplinaryCommandUptimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You had the buff from <SpellLink id={SPELLS.DISCIPLINARY_COMMAND_BUFF.id} /> up for{' '}
          {formatPercentage(this.percentUptimeDuringCombustion, 0)}% of your{' '}
          <SpellLink id={SPELLS.COMBUSTION.id} />. In order to get the most out of{' '}
          <SpellLink id={SPELLS.DISCIPLINARY_COMMAND_BUFF.id} /> you should ensure that you are
          triggering it with your <SpellLink id={SPELLS.COMBUSTION.id} /> cast, or within a couple
          seconds before, so that it is up for the entire duration of{' '}
          <SpellLink id={SPELLS.COMBUSTION.id} />.
        </>,
      )
        .icon(SPELLS.DISCIPLINARY_COMMAND_BUFF.icon)
        .actual(
          <Trans id="mage.fire.suggestions.disciplinaryCommand.uptime">
            {formatPercentage(actual, 0)}% Buff Uptime During Combustion
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <BoringSpellValueText spell={SPELLS.DISCIPLINARY_COMMAND}>
          {formatPercentage(this.percentUptimeDuringCombustion, 0)}%{' '}
          <small>Uptime during Combustion</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DisciplinaryCommand;
