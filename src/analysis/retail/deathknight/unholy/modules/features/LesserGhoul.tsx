import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { formatPercentage } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const BUFF_DURATION_MS = 30000;
const EXPIRE_BUFFER_MS = 100;

class LesserGhoul extends Analyzer {
  stacksGained = 0;
  stacksConsumed = 0;

  private currentStacks = 0;
  private buffAppliedAt: number | null = null;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onRemoveBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onRemoveBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.stacksGained += 1;
    this.currentStacks = 1;
    this.buffAppliedAt = event.timestamp;
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    const newStacks = event.stack;
    const gained = newStacks - this.currentStacks;
    this.stacksGained += gained;
    this.currentStacks = newStacks;
    this.buffAppliedAt = event.timestamp;
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    const newStacks = event.stack;
    const consumed = this.currentStacks - newStacks;
    this.stacksConsumed += consumed;
    this.currentStacks = newStacks;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (this.currentStacks === 0) {
      return;
    }

    /* The last stack fires removebuff instead of removebuffstack, so we use
    timing to tell apart a Scourge Strike consumption from a natural expiry. */
    const expectedExpireAt = (this.buffAppliedAt ?? event.timestamp) + BUFF_DURATION_MS;
    const isExpiration =
      event.timestamp >= expectedExpireAt - EXPIRE_BUFFER_MS &&
      event.timestamp <= expectedExpireAt + EXPIRE_BUFFER_MS;

    if (!isExpiration) {
      this.stacksConsumed += 1;
    }

    this.currentStacks = 0;
    this.buffAppliedAt = null;
  }

  get stacksExpired() {
    return this.stacksGained - this.stacksConsumed;
  }

  get efficiency() {
    return this.stacksGained > 0 ? this.stacksConsumed / this.stacksGained : 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        tooltip={
          <>
            <div>
              You consumed {this.stacksConsumed} out of {this.stacksGained} Lesser Ghoul stacks.
            </div>
            <div>{this.stacksExpired} stacks expired without being used.</div>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.LESSER_GHOUL_BUFF}>
          <>
            {formatPercentage(this.efficiency)} % <small>stack efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LesserGhoul;
