import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  HealEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import SPELLS_COMMON from 'common/SPELLS';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { BadColor, GoodColor } from 'interface/guide';
import { formatPercentage } from 'common/format';
import HIT_TYPES from 'game/HIT_TYPES';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringValue from 'parser/ui/BoringValueText';
import SpellLink from 'interface/SpellLink';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';

// 80% increase at 0% hp.
const NIUZAOS_RESOLVE_RATIO = 0.8;
const NIUZAOS_RESOLVE_TICK_RATE = 2000;

const DEBUG = false;

/**
 * Niuzao's Resolve converts Gift of the Ox orbs into a HoT. The HoT
 * amount scales with your missing HP. The scaling appears to be calculated at each tick,
 * not snapshotted when the HoT stack is applied. The HoT does a partial tick at the end,
 * which I haven't investigated further because it is a rounding error on total healing by NR.
 *
 * Validation last done on 11 Apr 2026
 */
export default class NiuzaosResolve extends Analyzer.withDependencies({
  healingDone: HealingDone,
}) {
  private totalBonusHealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.NIUZAOS_RESOLVE_TALENT);

    this.addEventListener(
      Events.heal.to(SELECTED_PLAYER).spell(SPELLS_COMMON.NIUZAOS_RESOLVE),
      this.onHeal,
    );

    // extra events used for model validation
    if (DEBUG) {
      this.addEventListener(
        Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS_COMMON.NIUZAOS_RESOLVE),
        this.updateStackCount,
      );
      this.addEventListener(
        Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS_COMMON.NIUZAOS_RESOLVE),
        this.updateStackCount,
      );
      this.addEventListener(
        Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS_COMMON.NIUZAOS_RESOLVE),
        this.updateStackCount,
      );
      this.addEventListener(
        Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS_COMMON.NIUZAOS_RESOLVE),
        this.updateStackCount,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.UNIMPORTANT()}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValue
          label={
            <>
              <SpellLink spell={SPELLS_COMMON.NIUZAOS_RESOLVE} /> Total Healing
            </>
          }
        >
          <ItemHealingDone
            amount={this.deps.healingDone.byAbility(SPELLS_COMMON.NIUZAOS_RESOLVE.id).effective}
          />
        </BoringValue>
        <BoringValue
          label={
            <>
              <SpellLink spell={SPELLS_COMMON.NIUZAOS_RESOLVE} /> Bonus Healing
            </>
          }
        >
          <ItemHealingDone amount={this.totalBonusHealing} approximate displayPercentage={false} />
          <small>
            {formatPercentage(
              this.totalBonusHealing /
                this.deps.healingDone.byAbility(SPELLS_COMMON.NIUZAOS_RESOLVE.id).effective,
            )}
            % of NR
          </small>
        </BoringValue>
      </Statistic>
    );
  }

  private currentStackCount = 0;

  // used for validation only. not part of calculation
  private previousEstimatedHealPerAP: number | undefined;
  private previousTickTimestamp = -Infinity;

  private onHeal(event: HealEvent): void {
    const preHealHp = event.hitPoints - event.amount;

    const totalHeal = event.amount + (event.absorbed ?? 0) + (event.overheal ?? 0);

    const bonusPct = (1 - preHealHp / event.maxHitPoints) * NIUZAOS_RESOLVE_RATIO;

    const effectiveBonus = calculateEffectiveHealing(event, bonusPct);
    this.totalBonusHealing += effectiveBonus;

    if (!DEBUG) {
      return;
    }

    const previousTickTimestamp = this.previousTickTimestamp;
    this.previousTickTimestamp = event.timestamp;
    if (event.timestamp - previousTickTimestamp < NIUZAOS_RESOLVE_TICK_RATE / 2) {
      return; // very likely a partial tick at the end of a hot. ignore.
    }

    // validation
    const estimatedRawHeal =
      totalHeal /
      (1 + bonusPct) /
      (event.hitType === HIT_TYPES.CRIT ? 2 : 1) /
      this.currentStackCount;
    const estimatedHealPerAP = estimatedRawHeal / event.attackPower;

    if (this.previousEstimatedHealPerAP !== undefined) {
      const diffPct =
        Math.abs(estimatedHealPerAP - this.previousEstimatedHealPerAP) /
        Math.max(estimatedHealPerAP, this.previousEstimatedHealPerAP);

      this.addDebugAnnotation(event, {
        color: diffPct < 0.05 ? GoodColor : BadColor,
        summary: `Estimate ${formatPercentage(diffPct, 2)}% drift (new: ${estimatedHealPerAP.toFixed(2)}, old: ${this.previousEstimatedHealPerAP.toFixed(2)}; stacks ${this.currentStackCount})`,
      });
    }
    this.previousEstimatedHealPerAP = estimatedHealPerAP;
  }

  private updateStackCount(
    event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent | RemoveBuffStackEvent,
  ): void {
    if (event.type === EventType.RemoveBuff) {
      this.currentStackCount = 0;
    } else if ('stack' in event) {
      this.currentStackCount = event.stack;
    } else {
      // applybuffstack
      this.currentStackCount = 1;
    }
  }
}
