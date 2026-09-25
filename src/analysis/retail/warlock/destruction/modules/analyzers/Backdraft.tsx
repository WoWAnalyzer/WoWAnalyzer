import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { TooltipElement } from 'interface/Tooltip';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  ApplyBuffStackEvent,
} from 'parser/core/Events';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import { SpellUse } from 'parser/core/SpellUsage/core';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class Backdraft extends Analyzer {
  get suggestionThresholds(): NumberThreshold {
    const wastedStacksPerMinute =
      ((this.wastedOvercapStacks + this.wastedExpiredStacks) / this.owner.fightDuration) *
      1000 *
      60;

    return {
      actual: wastedStacksPerMinute,
      isGreaterThan: {
        minor: 1,
        average: 1.5,
        major: 2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  private _maxStacks = 2;
  private _currentStacks = 0;
  private _lastBackdraftConsumptionTimestamp: number | null = null;

  wastedOvercapStacks = 0;
  wastedExpiredStacks = 0;

  uses: SpellUse[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.BACKDRAFT_TALENT);

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.INCINERATE, SPELLS.CHAOS_BOLT, TALENTS.SOUL_FIRE_TALENT]),
      this.onCast,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT),
      this.onBackdraftApplyStack,
    );

    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT),
      this.onBackdraftRemoveStack,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT),
      this.onBackdraftRemove,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BACKDRAFT),
      this.onBackdraftRefresh,
    );
  }

  onBackdraftApplyStack(event: ApplyBuffStackEvent) {
    // A stack was added without hitting the cap — just track the new count.
    this._currentStacks = event.stack;
  }

  onBackdraftRefresh(event: RefreshBuffEvent) {
    // WoW fires refreshbuff instead of applybuffstack when Conflagrate is cast at max stacks —
    // the new stacks are silently lost. Only record waste if we're actually tracking max stacks.
    if (this._currentStacks === this._maxStacks) {
      this.wastedOvercapStacks += this._maxStacks;

      this.uses.push({
        event: event as unknown as CastEvent,
        performance: QualitativePerformance.Fail,
        checklistItems: [],
        performanceExplanation: `Overcapped Backdraft by ${this._maxStacks} stack${this._maxStacks > 1 ? 's' : ''}`,
      });
    }
  }

  onBackdraftRemoveStack(event: RemoveBuffStackEvent) {
    this._currentStacks = event.stack;
  }

  onBackdraftRemove(event: RemoveBuffEvent) {
    // If a consuming cast happened within 100ms of this removebuff, the buff was spent normally.
    // Without this check, spending the last stack via a cast would incorrectly count as an expiration.
    const likelyConsumed =
      this._lastBackdraftConsumptionTimestamp !== null &&
      event.timestamp - this._lastBackdraftConsumptionTimestamp <= 100;

    if (!likelyConsumed && this._currentStacks > 0) {
      this.wastedExpiredStacks += this._currentStacks;

      this.uses.push({
        event: event as unknown as CastEvent,
        performance: QualitativePerformance.Fail,
        checklistItems: [],
        performanceExplanation: `Backdraft expired with ${this._currentStacks} stack${this._currentStacks > 1 ? 's' : ''} remaining`,
      });
    }
    this._currentStacks = 0;
  }

  onCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.BACKDRAFT.id)) {
      this._lastBackdraftConsumptionTimestamp = event.timestamp;
    }

    this._lastBackdraftConsumptionTimestamp = event.timestamp;
  }

  // fightStart/fightEnd unused — misses are tracked directly via onBackdraftRemove/onBackdraftApplyStack
  getSpellUsesWithPotentialMisses(_fightStart: number, _fightEnd: number): SpellUse[] {
    return this.uses;
  }

  get buffHistory() {
    return this.selectedCombatant.getBuffHistory(SPELLS.BACKDRAFT.id);
  }

  statistic() {
    const totalWasted = this.wastedOvercapStacks + this.wastedExpiredStacks;

    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS.BACKDRAFT_TALENT}>
          <div>
            <div>
              {totalWasted}{' '}
              <TooltipElement
                content={
                  <div>
                    <div>
                      <strong>Backdraft waste breakdown</strong>
                    </div>

                    <div style={{ marginTop: 6 }}>
                      <div>
                        <strong>Overcap:</strong> {this.wastedOvercapStacks}
                      </div>
                      <div style={{ marginLeft: 8 }}>You generated stacks at max charges</div>
                    </div>

                    <div style={{ marginTop: 6 }}>
                      <div>
                        <strong>Expired:</strong> {this.wastedExpiredStacks}
                      </div>
                      <div style={{ marginLeft: 8 }}>Buff ended before full consumption</div>
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

export default Backdraft;
