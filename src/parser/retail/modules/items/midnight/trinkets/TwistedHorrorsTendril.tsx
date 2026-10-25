import ITEMS from 'common/ITEMS/midnight/trinkets';
import SPELLS from 'common/SPELLS/midnight/trinkets';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringItemValueText from 'parser/ui/BoringItemValueText';
import { formatNumber } from 'common/format';
import { CriticalStrikeIcon } from 'interface/icons';
import SpellLink from 'interface/SpellLink';
import { calculateSecondaryStatDefault } from 'parser/core/stats';
import StatTracker from 'parser/shared/modules/StatTracker';

// tooltip coefficient of 0.119862
// https://www.wowhead.com/item=281215/twisted-horrors-tendril
const BASE_ILVL = 340;
const BASE_CRIT = 35.23;

const NEW_TARGET_STACKS = 3;

// overlapping applications show up as a removebuff + applybuff pair while stacks are still active
const REAPPLY_BUFFER_MS = 10;

export default class TwistedHorrorsTendril extends Analyzer.withDependencies({
  statTracker: StatTracker,
}) {
  protected newTargetProcs: number[] = [];
  private stacks = 0;
  private lastStackChange = 0;
  private weightedStackTime = 0;
  private lastRemoval: { timestamp: number; stacks: number } | null = null;

  critPerStack = BASE_CRIT;

  constructor(options: Options) {
    super(options);

    const tendril = this.selectedCombatant.getTrinket(ITEMS.TWISTED_HORRORS_TENDRIL.id);
    if (!tendril) {
      this.active = false;
      return;
    }

    this.critPerStack = calculateSecondaryStatDefault(BASE_ILVL, BASE_CRIT, tendril.itemLevel);
    this.deps.statTracker.add(SPELLS.DEVASTATING_POWER.id, { crit: this.critPerStack });

    this.lastStackChange = this.owner.fight.start_time;

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.DEVASTATING_POWER),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.DEVASTATING_POWER),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.DEVASTATING_POWER),
      this.onStackChange,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.DEVASTATING_POWER),
      this.onStackChange,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onApplyBuff(event: ApplyBuffEvent) {
    // keep stacks from before removal if this is just an overlap
    if (this.lastRemoval && event.timestamp - this.lastRemoval.timestamp <= REAPPLY_BUFFER_MS) {
      this.setStacks(this.lastRemoval.stacks, event.timestamp);
    } else {
      this.setStacks(1, event.timestamp);
    }
    this.lastRemoval = null;
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    this.lastRemoval = { timestamp: event.timestamp, stacks: this.stacks };
    this.setStacks(0, event.timestamp);
  }

  private onStackChange(event: ApplyBuffStackEvent | RemoveBuffStackEvent) {
    if (event.stack - this.stacks >= NEW_TARGET_STACKS) {
      this.newTargetProcs.push(event.timestamp);
    }
    this.setStacks(event.stack, event.timestamp);
  }

  private onFightEnd(event: FightEndEvent) {
    this.setStacks(0, event.timestamp);
  }

  private setStacks(stacks: number, timestamp: number) {
    this.weightedStackTime += this.stacks * (timestamp - this.lastStackChange);
    this.stacks = stacks;
    this.lastStackChange = timestamp;
  }

  get averageStacks() {
    return this.weightedStackTime / this.owner.fightDuration;
  }

  get averageCrit() {
    return this.averageStacks * this.critPerStack;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            <div>
              Each stack of <SpellLink spell={SPELLS.DEVASTATING_POWER} /> grants{' '}
              <b>{this.critPerStack}</b> Critical Strike.
            </div>
            <div>
              Striking a new target granted {NEW_TARGET_STACKS} stacks at once{' '}
              <b>{this.newTargetProcs.length}</b> times (
              {this.owner.getPerMinute(this.newTargetProcs.length).toFixed(2)} per minute).
            </div>
          </>
        }
      >
        <BoringItemValueText item={ITEMS.TWISTED_HORRORS_TENDRIL}>
          <div>
            {this.averageStacks.toFixed(1)} <small>average stacks</small>
          </div>
          <div>
            <CriticalStrikeIcon /> {formatNumber(this.averageCrit)}{' '}
            <small>average Critical Strike</small>
          </div>
          <div>
            {this.newTargetProcs.length} <small>new target procs</small>
          </div>
        </BoringItemValueText>
      </Statistic>
    );
  }
}
