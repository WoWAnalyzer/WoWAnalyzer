import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

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

  onRefreshBuff() {
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are wasting <SpellLink spell={SPELLS.SUDDEN_DOOM_BUFF} /> procs. It is important to
          cast <SpellLink spell={SPELLS.DEATH_COIL} />.
        </>,
      )
        .icon(SPELLS.SUDDEN_DOOM_BUFF.icon)
        .actual(
          defineMessage({
            id: 'deathknight.unholy.suggestions.suddendoom.wastedProcs',
            message: `${this.wastedProcs} procs were refreshed or expired without being used`,
          }),
        )
        .recommended(`<${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        tooltip="A proc counts as wasted if it fades without being used or if it refreshes"
      >
        <BoringSpellValueText spell={SPELLS.SUDDEN_DOOM_BUFF}>
          <>
            {this.wastedProcs} <small>wasted procs</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SuddenDoom;
