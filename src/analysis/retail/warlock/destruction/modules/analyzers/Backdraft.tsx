import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { TooltipElement } from 'interface/Tooltip';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
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

const debug = false;

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

  wastedOvercapStacks = 0;
  wastedExpiredStacks = 0;

  private _buffedChaosBoltCasts = 0;
  private _buffedIncinerateCasts = 0;
  private _buffedSoulFireCasts = 0;

  uses: SpellUse[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.BACKDRAFT_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONFLAGRATE),
      this.onConflagrateCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INCINERATE),
      this.onIncinerateCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CHAOS_BOLT),
      this.onChaosBoltCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SOUL_FIRE_TALENT),
      this.onSoulFireCast,
    );

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);

    // ✔ Correct stack authority (no drift)
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
  }

  onConflagrateCast(event: CastEvent) {
    if (debug) {
      console.log('Conflagrate at', event.timestamp);
    }
  }

  onBackdraftApplyStack(event: ApplyBuffStackEvent) {
    const stacks = event.stack || 0;

    if (stacks > this._maxStacks) {
      const overcapped = stacks - this._maxStacks;
      this.wastedOvercapStacks += overcapped;
      this._currentStacks = this._maxStacks;

      this.uses.push({
        event: event as unknown as CastEvent,
        performance: QualitativePerformance.Fail,
        checklistItems: [],
        performanceExplanation: `Overcapped Backdraft by ${overcapped} stack${overcapped > 1 ? 's' : ''}`,
      });
    } else {
      this._currentStacks = stacks;
    }
  }

  onBackdraftRemoveStack(event: RemoveBuffStackEvent) {
    this._currentStacks = event.stack;
  }

  onBackdraftRemove(event: RemoveBuffEvent) {
    if (this._currentStacks > 0) {
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

  // ------------------------
  // CAST TRACKING
  // ------------------------

  onIncinerateCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.BACKDRAFT.id)) {
      this._buffedIncinerateCasts += 1;
    }
  }

  onChaosBoltCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.BACKDRAFT.id)) {
      this._buffedChaosBoltCasts += 1;
    }
  }

  onSoulFireCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.BACKDRAFT.id)) {
      this._buffedSoulFireCasts += 1;
    }
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    const isTrackedSpell =
      spellId === SPELLS.CHAOS_BOLT.id ||
      spellId === SPELLS.INCINERATE.id ||
      spellId === TALENTS.SOUL_FIRE_TALENT.id;

    if (!isTrackedSpell) return;

    const hasBackdraft = this.selectedCombatant.hasBuff(SPELLS.BACKDRAFT.id);
    if (!hasBackdraft) return;

    let performance = QualitativePerformance.Ok;

    if (spellId === SPELLS.CHAOS_BOLT.id || spellId === TALENTS.SOUL_FIRE_TALENT.id) {
      performance = QualitativePerformance.Good;
    }

    const spellName = SPELLS[spellId]?.name ?? 'Unknown Spell';

    this.uses.push({
      event,
      performance,
      checklistItems: [],
      performanceExplanation: `Consumed Backdraft with ${spellName}`,
    });
  }

  getSpellUsesWithPotentialMisses(fightStart: number, fightEnd: number): SpellUse[] {
    return this.uses
      .filter((use) => use.event.timestamp >= fightStart && use.event.timestamp <= fightEnd)
      .sort((a, b) => a.event.timestamp - b.event.timestamp);
  }

  get buffedChaosBoltCasts() {
    return this._buffedChaosBoltCasts;
  }

  get buffedIncinerateCasts() {
    return this._buffedIncinerateCasts;
  }

  get buffedSoulFireCasts() {
    return this._buffedSoulFireCasts;
  }

  get totalBuffedCasts() {
    return this._buffedChaosBoltCasts + this._buffedIncinerateCasts + this._buffedSoulFireCasts;
  }

  get percentageOfChaosBoltAmongBuffedCasts() {
    return this.totalBuffedCasts === 0 ? 0 : this._buffedChaosBoltCasts / this.totalBuffedCasts;
  }

  get percentageOfSoulFireAmongBuffedCasts() {
    return this.totalBuffedCasts === 0 ? 0 : this._buffedSoulFireCasts / this.totalBuffedCasts;
  }

  get hasSoulFireTalent() {
    return this.selectedCombatant.hasTalent(TALENTS.SOUL_FIRE_TALENT);
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

            <div>
              {formatPercentage(this.percentageOfChaosBoltAmongBuffedCasts, 0)}%
              <TooltipElement content={`${this.buffedChaosBoltCasts}/${this.totalBuffedCasts}`}>
                <small> buffed casts - Chaos Bolt</small>
              </TooltipElement>
            </div>

            {this.hasSoulFireTalent && (
              <div>
                {formatPercentage(this.percentageOfSoulFireAmongBuffedCasts, 0)}%
                <TooltipElement content={`${this.buffedSoulFireCasts}/${this.totalBuffedCasts}`}>
                  <small> buffed casts - Soul Fire</small>
                </TooltipElement>
              </div>
            )}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Backdraft;
