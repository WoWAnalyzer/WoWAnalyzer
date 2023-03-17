import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

const BUFF_DURATION = 10000;
const BUFFER = 100;
const MAX_STACKS = 2;

class TormentedCrescendo extends Analyzer {
  wastedProcs = 0;
  stacks = 0;
  private buffApplyTimestamp: number | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TORMENTED_CRESCENDO_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TORMENTED_CRESCENDO_BUFF),
      this.onTormentedCrescendoApplyRefresh,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TORMENTED_CRESCENDO_BUFF),
      this.onTormentedCrescendoApplyRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TORMENTED_CRESCENDO_BUFF),
      this.onTormentedCrescendoRemove,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.TORMENTED_CRESCENDO_BUFF),
      this.onTormentedCrescendoApplyStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.TORMENTED_CRESCENDO_BUFF),
      this.onTormentedCrescendoRemoveStack,
    );
  }

  onTormentedCrescendoApplyRefresh(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.stacks === MAX_STACKS) {
      this.wastedProcs += 1;
    } else {
      this.stacks += 1;
    }
    this.buffApplyTimestamp = event.timestamp;
  }

  onTormentedCrescendoApplyStack(event: ApplyBuffStackEvent) {
    this.stacks += 1;
    this.buffApplyTimestamp = event.timestamp;
  }

  onTormentedCrescendoRemoveStack() {
    this.stacks -= 1;
  }

  onTormentedCrescendoRemove(event: RemoveBuffEvent) {
    const expectedEnd = this.buffApplyTimestamp || 0 + BUFF_DURATION;
    if (expectedEnd - BUFFER <= event.timestamp && event.timestamp <= expectedEnd + BUFFER) {
      this.wastedProcs += 1;
    }
    this.stacks = 0;
    this.buffApplyTimestamp = null;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS.TORMENTED_CRESCENDO_TALENT}>
          {this.wastedProcs} <small>wasted procs</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TormentedCrescendo;
