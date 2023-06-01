import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import { formatNumber } from 'common/format';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import { calculatePrimaryStat } from 'parser/core/stats';
import ITEMS from 'common/ITEMS';

const BASE_PRIMARY_STAT_PER_STACK = 814;
const BASE_ILVL = 418;

class CallToDominance extends Analyzer {
  statPerStack: number = 0;
  statGainedList: number[] = [];
  constructor(options: Options) {
    super(options);
    const trinket = this.selectedCombatant.getTrinket(ITEMS.CALL_TO_DOMINANCE.id);
    this.active = trinket !== undefined;
    if (!this.active) {
      return;
    }
    this.statPerStack = calculatePrimaryStat(
      BASE_ILVL,
      BASE_PRIMARY_STAT_PER_STACK,
      trinket!.itemLevel,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(ITEMS.DOMINEERING_ARROGANCE_BUFF),
      this.onBuffRemove,
    );
  }

  onBuffRemove(event: RemoveBuffEvent) {
    this.statGainedList.push(
      this.selectedCombatant.getBuffStacks(ITEMS.DOMINEERING_ARROGANCE_BUFF.id) * this.statPerStack,
    );
  }

  get averagePrimaryStat() {
    return (
      this.statGainedList.reduce((prev, cur) => {
        return prev + cur;
      }, 0) / this.statGainedList.length
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(8)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringItemValueText item={ITEMS.CALL_TO_DOMINANCE}>
          {formatNumber(this.averagePrimaryStat)} <small>avg primary stat per cast</small>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default CallToDominance;
