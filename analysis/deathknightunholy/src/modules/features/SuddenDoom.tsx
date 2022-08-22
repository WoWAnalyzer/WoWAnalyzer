import { t, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { Fragment } from 'react';

const BUFF_DURATION_MS = 10000;

class SuddenDoom extends Analyzer {
  wastedProcs = 0;
  lastProcTime = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRemoveBuff,
    );
  }

  onBuff(event: ApplyBuffEvent) {
    this.lastProcTime = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > BUFF_DURATION_MS) {
      this.wastedProcs += 1;
    }
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.wastedProcs += 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedProcs,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 4,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get optionalSuggestion() {
    if (this.selectedCombatant.hasTalent(SPELLS.ARMY_OF_THE_DAMNED_TALENT)) {
      return (
        <Trans id="deathknight.unholy.suddenDoom.suggestion.optional">
          , <SpellLink id={SPELLS.ARMY_OF_THE_DEAD.id} />, and{' '}
          <SpellLink id={SPELLS.APOCALYPSE.id} />
        </Trans>
      );
    }
    return <Fragment />;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="deathknight.unholy.suddenDoom.suggestion">
          You are wasting procs of <SpellLink id={SPELLS.SUDDEN_DOOM_BUFF.id} />. It is important to
          cast <SpellLink id={SPELLS.DEATH_COIL.id} /> as soon as possible after getting a proc to
          ensure you are not losing potential cooldown reduction on{' '}
          <SpellLink id={SPELLS.DARK_TRANSFORMATION.id} /> {this.optionalSuggestion}.
        </Trans>,
      )
        .icon(SPELLS.SUDDEN_DOOM_BUFF.icon)
        .actual(
          t({
            id: 'deathknight.unholy.suddenDoom.suggestion.actual',
            message: `${this.wastedProcs} procs were refreshed or expired without being used`,
          }),
        )
        .recommended(
          t({
            id: 'deathknight.unholy.suddenDoom.suggestion.recommended',
            message: `<${recommended} is recommended`,
          }),
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        tooltip={t({
          id: 'deathknight.unholy.suddenDoom.statistic.tooltip',
          message: 'A proc counts as wasted if it fades without being used or if it refreshes',
        })}
      >
        <BoringSpellValueText spellId={SPELLS.SUDDEN_DOOM_BUFF.id}>
          <Trans id="deathknight.unholy.suddenDoom.statistic">
            {this.wastedProcs} <small>wasted procs</small>
          </Trans>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SuddenDoom;
