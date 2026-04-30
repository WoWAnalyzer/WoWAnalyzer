import ITEMS from 'common/ITEMS/midnight/trinkets';
import SPELLS from 'common/SPELLS/midnight/trinkets';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { ItemLink, SpellIcon } from 'interface';

const BASE_HEALING_INCREASE = 0.3;
const MAX_HEALING_INCREASE = 1.5;

interface HealProc {
  timestamp: number;
  targetCount: number;
  totalHealing: number;
}

export default class LightOfTheCosmicCrescendo extends Analyzer {
  protected damage = 0;
  protected healing = 0;
  protected healProcs: HealProc[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTrinket(ITEMS.LIGHT_OF_THE_COSMIC_CRESCENDO.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.COSMIC_CRESCENDO),
      this.onDamage,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.COSMIC_HYMN), this.onHeal);
  }

  private currentProc: HealProc | null = null;

  private onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  private onHeal(event: HealEvent) {
    const healing = event.amount + (event.absorbed || 0);
    this.healing += healing;

    // most procs are on the same timestamp but a few are delayed by a millisecond
    if (!this.currentProc || event.timestamp - this.currentProc.timestamp > 100) {
      if (this.currentProc) {
        this.healProcs.push(this.currentProc);
      }
      this.currentProc = {
        timestamp: event.timestamp,
        targetCount: 1,
        totalHealing: healing,
      };
    } else {
      this.currentProc.targetCount += 1;
      this.currentProc.totalHealing += healing;
    }
  }

  onFightEnd() {
    if (this.currentProc) {
      this.healProcs.push(this.currentProc);
    }
  }

  get totalProcs() {
    return this.healProcs.length;
  }

  get averageTargets() {
    if (this.healProcs.length === 0) return 0;

    const totalTargets = this.healProcs.reduce((sum, proc) => sum + proc.targetCount, 0);
    return totalTargets / this.healProcs.length;
  }

  get averageHealingPerProc() {
    if (this.healProcs.length === 0) return 0;

    return this.healing / this.healProcs.length;
  }

  get averageHealingIncrease() {
    if (this.healProcs.length === 0) return 0;

    // max is -probably- not needed? the trinket only heals 5 players for each proc but keeping for failsafe
    const totalIncrease = this.healProcs.reduce(
      (sum, proc) => sum + Math.min(proc.targetCount * BASE_HEALING_INCREASE, MAX_HEALING_INCREASE),
      0,
    );
    return totalIncrease / this.healProcs.length;
  }

  statistic() {
    const procRows = this.healProcs.map((proc, index) => {
      const castTime = proc.timestamp - this.owner.fight.start_time;
      return (
        <tr key={index}>
          <td>{formatDuration(castTime)}</td>
          <td>{proc.targetCount}</td>
          <td>{formatNumber(proc.totalHealing)}</td>
        </tr>
      );
    });

    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <ItemLink id={ITEMS.LIGHT_OF_THE_COSMIC_CRESCENDO.id} /> healed <b>{this.totalProcs}</b>{' '}
            times ({this.owner.getPerMinute(this.totalProcs).toFixed(2)} procs per minute).
          </>
        }
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Targets</th>
                  <th>Healing</th>
                </tr>
              </thead>
              <tbody>{procRows}</tbody>
            </table>
          </>
        }
      >
        <BoringItemValueText item={ITEMS.LIGHT_OF_THE_COSMIC_CRESCENDO}>
          <div>
            {formatPercentage(this.averageHealingIncrease)}% <small>average increase</small>
          </div>
          <div>
            <SpellIcon spell={SPELLS.COSMIC_HYMN} /> {formatNumber(this.averageHealingPerProc)}{' '}
            <small>average healing per proc</small>
          </div>
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
        </BoringItemValueText>
      </Statistic>
    );
  }
}
