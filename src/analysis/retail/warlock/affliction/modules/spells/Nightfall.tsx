import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const BUFF_DURATION = 12000;
const BUFFER = 100;

class Nightfall extends Analyzer {
  wastedProcs = 0;
  private buffApplyTimestamp: number | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.NIGHTFALL_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.NIGHTFALL_BUFF),
      this.onNightfallApplyRefresh,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.NIGHTFALL_BUFF),
      this.onNightfallApplyRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.NIGHTFALL_BUFF),
      this.onNightfallRemove,
    );
  }

  onNightfallApplyRefresh(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.buffApplyTimestamp !== null) {
      this.wastedProcs += 1;
    }
    this.buffApplyTimestamp = event.timestamp;
  }

  onNightfallRemove(event: RemoveBuffEvent) {
    const expectedEnd = this.buffApplyTimestamp || 0 + BUFF_DURATION;
    if (expectedEnd - BUFFER <= event.timestamp && event.timestamp <= expectedEnd + BUFFER) {
      // buff fell off naturally
      this.wastedProcs += 1;
    }
    this.buffApplyTimestamp = null;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS.NIGHTFALL_TALENT.id}>
          {this.wastedProcs} <small>wasted procs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Nightfall;
