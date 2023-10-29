import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';

class AmalgamsSeventhSpine extends Analyzer {
  manaGain: number = 0;
  wastedManaGain: number = 0;
  refreshes: number = 0;
  applies: number = 0;
  effectiveApplies: number = 0;
  resourcePerEnergize: number = 0;
  constructor(options: Options) {
    super(options);
    const trinket = this.selectedCombatant.getTrinket(ITEMS.AMALGAMS_SEVENTH_SPINE.id);
    this.active = trinket !== undefined;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(ITEMS.FRAGILE_ECHO),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(ITEMS.FRAGILE_ECHO),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(ITEMS.FRAGILE_ECHO_MANA),
      this.onResourceChange,
    );
  }

  onBuffApply(event: ApplyBuffEvent) {
    this.applies += 1;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    this.refreshes += 1;
  }

  onResourceChange(event: ResourceChangeEvent) {
    this.manaGain += event.resourceChange;
    this.wastedManaGain += event.waste;
    if (event.waste === 0) {
      this.resourcePerEnergize = event.resourceChange;
    }

    this.effectiveApplies += 1;
  }

  get potentialManaLost() {
    return this.refreshes * this.resourcePerEnergize;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(9)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <ul>
            <li>
              Total Buffs Applied: <strong>{formatNumber(this.applies + this.refreshes)}</strong>
            </li>
            <li>
              Realized Buffs: <strong>{formatNumber(this.effectiveApplies)}</strong>
            </li>
            <li>
              Refreshes: <strong>{formatNumber(this.refreshes)}</strong>
            </li>
            <li>
              Potential Mana Lost: <strong>{formatNumber(this.potentialManaLost)}</strong>
            </li>
          </ul>
        }
      >
        <BoringItemValueText item={ITEMS.AMALGAMS_SEVENTH_SPINE}>
          <ItemManaGained amount={this.manaGain} useAbbrev />
          <br />
          <small>Wasted: {formatNumber(this.wastedManaGain)}</small>
        </BoringItemValueText>
      </Statistic>
    );
  }
}

export default AmalgamsSeventhSpine;
