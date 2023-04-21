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

const BUFF_DURATION = 20000;
const BUFFER = 100;
const MAX_STACKS = 50;

class InevitableDemise extends Analyzer {
  wastedStacks = 0;
  stacks = 0;
  private buffApplyTimestamp: number | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INEVITABLE_DEMISE_TALENT);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INEVITABLE_DEMISE_BUFF),
      this.onInevitableDemiseApplyRefresh,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.INEVITABLE_DEMISE_BUFF),
      this.onInevitableDemiseApplyRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INEVITABLE_DEMISE_BUFF),
      this.onInevitableDemiseRemove,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INEVITABLE_DEMISE_BUFF),
      this.onInevitableDemiseApplyStack,
    );
  }

  onInevitableDemiseApplyRefresh(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (this.stacks === MAX_STACKS) {
      this.wastedStacks += 1;
    }
    this.buffApplyTimestamp = event.timestamp;
  }

  onInevitableDemiseApplyStack(event: ApplyBuffStackEvent) {
    this.stacks = event.stack;
  }

  onInevitableDemiseRemove(event: RemoveBuffEvent) {
    const expectedEnd = this.buffApplyTimestamp || 0 + BUFF_DURATION;
    if (expectedEnd - BUFFER <= event.timestamp && event.timestamp <= expectedEnd + BUFFER) {
      this.wastedStacks += this.stacks;
    }
    this.stacks = 0;
    this.buffApplyTimestamp = null;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS.INEVITABLE_DEMISE_TALENT}>
          {this.wastedStacks} <small>wasted stacks</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default InevitableDemise;
