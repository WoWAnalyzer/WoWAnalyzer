import { EVOKER_TWW1_ID } from 'common/ITEMS/dragonflight';
import { TIERS } from 'game/TIERS';
import ItemSetLink from 'interface/ItemSetLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import {
  getT32SourceEvent,
  isRevBuffedFromT32,
  isT32ProcWasted,
} from '../../normalizers/EventLinking/helpers';
import { SPELL_COLORS } from '../../constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { formatNumber } from 'common/format';
import DonutChart from 'parser/ui/DonutChart';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import SpellLink from 'interface/SpellLink';

const REV_INC = 2;

class T32Prevoker extends Analyzer {
  twoPcHealingBySpell = new Map<number, number>();
  fourPcHealing: number = 0;
  totalBuffedTicks: number = 0;
  totalConsumed: number = 0;
  totalWasted: number = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW1);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EPOCH_FRAGMENT),
      this.on2PCHeal,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.REVERSION_TALENT),
      this.onRevHeal,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.T32_4PC_BUFF),
      this.on4PCRemoval,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.T32_4PC_BUFF),
      this.on4PCRemoval,
    );
  }

  on2PCHeal(event: HealEvent) {
    const sourceEvent = getT32SourceEvent(event);
    const amount = event.amount + (event.absorbed || 0);
    if (!sourceEvent) {
      this.twoPcHealingBySpell.set(0, (this.twoPcHealingBySpell.get(0) ?? 0) + amount);
    } else {
      this.twoPcHealingBySpell.set(
        sourceEvent.ability.guid,
        (this.twoPcHealingBySpell.get(sourceEvent.ability.guid) ?? 0) + amount,
      );
    }
  }

  onRevHeal(event: HealEvent) {
    if (isRevBuffedFromT32(event)) {
      this.totalBuffedTicks += 1;
      this.fourPcHealing += calculateEffectiveHealing(event, REV_INC);
    }
  }

  on4PCRemoval(event: RemoveBuffEvent | RefreshBuffEvent) {
    this.totalConsumed += 1;
    this.totalWasted += isT32ProcWasted(event) ? 1 : 0;
  }

  get emeraldBlossom2PC() {
    return (
      (this.twoPcHealingBySpell.get(SPELLS.EMERALD_BLOSSOM.id) || 0) +
      (this.twoPcHealingBySpell.get(SPELLS.EMERALD_BLOSSOM_ECHO.id) || 0)
    );
  }

  get reversion2PC() {
    return (
      (this.twoPcHealingBySpell.get(TALENTS_EVOKER.REVERSION_TALENT.id) || 0) +
      (this.twoPcHealingBySpell.get(SPELLS.REVERSION_ECHO.id) || 0)
    );
  }

  get total2PCHealing() {
    return this.emeraldBlossom2PC + this.reversion2PC + (this.twoPcHealingBySpell.get(0) || 0);
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM.id,
        value: this.emeraldBlossom2PC,
        valueTooltip: formatNumber(this.emeraldBlossom2PC),
      },
      {
        color: SPELL_COLORS.REVERSION,
        label: 'Reversion',
        spellId: TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id,
        value: this.reversion2PC,
        valueTooltip: formatNumber(this.reversion2PC),
      },
    ];
    // shouldn't happen
    if (this.twoPcHealingBySpell.has(0)) {
      items.push({
        color: SPELL_COLORS.REWIND,
        label: 'Other',
        spellId: 0,
        value: this.twoPcHealingBySpell.get(0) || 0,
        valueTooltip: formatNumber(this.twoPcHealingBySpell.get(0) || 0),
      });
    }
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <ItemSetLink id={EVOKER_TWW1_ID} /> (T32 tier set){' '}
        <div className="pad">
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.total2PCHealing} />
          {this.renderDonutChart()}
        </div>
        <div className="pad">
          <h4>4 piece</h4>
          <div>
            <ItemHealingDone amount={this.fourPcHealing} />
          </div>
          <div>Total procs consumed: {this.totalConsumed}</div>
          <div>Total procs wasted: {this.totalWasted}</div>
          <div>
            Total buffed <SpellLink spell={TALENTS_EVOKER.REVERSION_TALENT} /> ticks:{' '}
            {this.totalBuffedTicks}
          </div>
        </div>
      </Statistic>
    );
  }
}

export default T32Prevoker;
