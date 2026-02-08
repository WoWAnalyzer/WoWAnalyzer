import SPELLS from 'common/SPELLS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const BUFF_DURATION_MS = 10000;

class SuddenDoom extends Analyzer {
  totalProcs = 0;
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
    this.totalProcs += 1;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > BUFF_DURATION_MS) {
      this.wastedProcs += 1;
    }
  }

  onRefreshBuff() {
    this.totalProcs += 1;
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

  get usedProcs() {
    return this.totalProcs - this.wastedProcs;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
        tooltip={`Dread Plague has a 35% chance to proc Sudden Doom, making your next Death Coil or Epidemic cost 10 less Runic Power and deal 35% increased damage. A proc counts as wasted if it fades without being used or if it refreshes.`}
      >
        <BoringSpellValueText spell={SPELLS.SUDDEN_DOOM_BUFF}>
          <>
            {this.usedProcs}/{this.totalProcs} <small>procs used</small>
            <br />
            {this.wastedProcs} <small>wasted</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SuddenDoom;
