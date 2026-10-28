import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { TooltipElement } from 'interface/Tooltip';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ApplyBuffStackEvent,
  ApplyBuffEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

const BUFF_DURATION = 30000;

class ShardInstability extends Analyzer {
  private _currentStacks = 0;
  private _lastRefreshTimestamp = 0;
  private _procsGained = 0;
  private _stackChangeTimestamps = new Set<number>();
  private _refreshTimestamps: number[] = [];

  wastedExpiredStacks = 0;

  get wastedOvercapStacks(): number {
    return this._refreshTimestamps.filter(
      (timestamp) => !this._stackChangeTimestamps.has(timestamp),
    ).length;
  }

  get totalProcs(): number {
    return this._procsGained + this.wastedOvercapStacks;
  }

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SHARD_INSTABILITY_TALENT);

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SHARD_INSTABILITY_BUFF),
      this.onApplyStack,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SHARD_INSTABILITY_BUFF),
      this.onRemoveStack,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SHARD_INSTABILITY_BUFF),
      this.onRemove,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SHARD_INSTABILITY_BUFF),
      this.onRefresh,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHARD_INSTABILITY_BUFF),
      this.onApply,
    );
  }

  onApply(event: ApplyBuffEvent) {
    this._procsGained += 1;
    this._currentStacks = 1;
    this._lastRefreshTimestamp = event.timestamp;
    this._stackChangeTimestamps.add(event.timestamp);
  }

  onApplyStack(event: ApplyBuffStackEvent) {
    // Track the new stack count and reset the 30s timer
    this._procsGained += 1;
    this._currentStacks = event.stack;
    this._lastRefreshTimestamp = event.timestamp;
    this._stackChangeTimestamps.add(event.timestamp);
  }

  onRefresh(event: RefreshBuffEvent) {
    this._refreshTimestamps.push(event.timestamp);
    this._lastRefreshTimestamp = event.timestamp;
  }

  onRemoveStack(event: RemoveBuffStackEvent) {
    this._currentStacks = event.stack;
    this._stackChangeTimestamps.add(event.timestamp);
  }

  onRemove(event: RemoveBuffEvent) {
    const expired = event.timestamp - this._lastRefreshTimestamp >= BUFF_DURATION - 500;
    if (expired) {
      this.wastedExpiredStacks += this._currentStacks;
    }
    this._currentStacks = 0;
  }

  get buffHistory() {
    return this.selectedCombatant.getBuffHistory(SPELLS.SHARD_INSTABILITY_BUFF.id);
  }

  get maxObservedStacks(): number {
    const stacks = this.buffHistory.flatMap((buff) =>
      buff.stackHistory.map((entry) => entry.stacks),
    );
    return Math.max(1, ...stacks);
  }

  statistic() {
    const totalWasted = this.wastedOvercapStacks + this.wastedExpiredStacks;

    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS.SHARD_INSTABILITY_TALENT}>
          <div>
            <div>
              {totalWasted}{' '}
              <TooltipElement
                content={
                  <div>
                    <div>
                      <strong>Shard Instability waste breakdown</strong>
                    </div>

                    <div style={{ marginTop: 6 }}>
                      <div>
                        <strong>Overcap:</strong> {this.wastedOvercapStacks}
                      </div>
                      <div style={{ marginLeft: 8 }}>Procs gained while already at 3 stacks</div>
                    </div>

                    <div style={{ marginTop: 6 }}>
                      <div>
                        <strong>Expired:</strong> {this.wastedExpiredStacks}
                      </div>
                      <div style={{ marginLeft: 8 }}>Buff expired before you spent it</div>
                    </div>

                    <div style={{ marginTop: 6 }}>
                      <strong>Total:</strong> {totalWasted}
                    </div>
                  </div>
                }
              >
                <small>Wasted procs</small>
              </TooltipElement>
            </div>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ShardInstability;
