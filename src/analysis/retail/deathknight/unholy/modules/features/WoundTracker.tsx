import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffStackEvent,
  RemoveDebuffStackEvent,
  RemoveDebuffEvent,
  ApplyDebuffEvent,
  CastEvent,
} from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const MAX_WOUNDS = 6;

class WoundTracker extends Analyzer {
  private _targets: Record<string, number> = {};
  private wastedWounds = 0;
  private totalWoundsApplied = 0;
  private woundsBursted = 0;
  private apocalypseCasts = 0;
  private apocalypseWoundsWasted = 0;

  public get targets(): Record<string, number> {
    return this._targets;
  }

  constructor(options: Options) {
    super(options);

    // Track wound applications
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND),
      this.onFesteringWoundChange,
    );
    this.addEventListener(
      Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND),
      this.onFesteringWoundChange,
    );
    this.addEventListener(
      Events.removedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND),
      this.onFesteringWoundChange,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.FESTERING_WOUND),
      this.onFesteringWoundChange,
    );

    // Track casts to count wounds applied
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.FESTERING_STRIKE_TALENT),
      this.onFesteringStrike,
    );

    // Track Apocalypse usage
    if (this.selectedCombatant.hasTalent(TALENTS.APOCALYPSE_TALENT)) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS.APOCALYPSE_TALENT),
        this.onApocalypse,
      );
    }
  }

  onFesteringWoundChange(
    event: ApplyDebuffEvent | ApplyDebuffStackEvent | RemoveDebuffStackEvent | RemoveDebuffEvent,
  ) {
    const targetString = encodeTargetString(event.targetID, event.targetInstance);
    const previousStacks = this._targets[targetString] || 0;
    const newStacks = currentStacks(event);

    this._targets[targetString] = newStacks;

    // Track wounds bursted
    if (newStacks < previousStacks) {
      this.woundsBursted += previousStacks - newStacks;
    }
  }

  onFesteringStrike(event: CastEvent) {
    const targetString = encodeTargetString(event.targetID!, event.targetInstance);
    const currentWounds = this._targets[targetString] || 0;
    const woundsToApply = 2; // Festering Strike applies 2-3, using 2 as baseline

    this.totalWoundsApplied += woundsToApply;

    // Check if we're overcapping
    if (currentWounds + woundsToApply > MAX_WOUNDS) {
      this.wastedWounds += currentWounds + woundsToApply - MAX_WOUNDS;
    }
  }

  onApocalypse(event: CastEvent) {
    this.apocalypseCasts += 1;
    const targetString = encodeTargetString(event.targetID!, event.targetInstance);
    const wounds = this._targets[targetString] || 0;

    // Apocalypse is less effective with fewer than 4 wounds
    if (wounds < 4) {
      this.apocalypseWoundsWasted += 4 - wounds;
    }
  }

  get woundEfficiency() {
    if (this.totalWoundsApplied === 0) return 100;
    return ((this.totalWoundsApplied - this.wastedWounds) / this.totalWoundsApplied) * 100;
  }

  get performanceLevel(): QualitativePerformance {
    const efficiency = this.woundEfficiency;
    if (efficiency >= 95) return QualitativePerformance.Perfect;
    if (efficiency >= 90) return QualitativePerformance.Good;
    if (efficiency >= 80) return QualitativePerformance.Ok;
    return QualitativePerformance.Fail;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        tooltip={
          <>
            You applied {this.totalWoundsApplied} wounds and wasted {this.wastedWounds} by
            overcapping.
            {this.apocalypseCasts > 0 && (
              <>
                {' '}
                You cast Apocalypse {this.apocalypseCasts} times with suboptimal wound counts{' '}
                {this.apocalypseWoundsWasted} times.
              </>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.FESTERING_WOUND}>
          <>
            {this.woundEfficiency.toFixed(0)}% <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection() {
    const barColor = this.getBarColor();
    const explanation = (
      <div>
        <p>
          <b>
            <SpellLink spell={SPELLS.FESTERING_WOUND} />
          </b>{' '}
          is a key mechanic for Unholy DKs. You apply wounds using{' '}
          <SpellLink spell={TALENTS.FESTERING_STRIKE_TALENT} /> and burst them with abilities like{' '}
          <SpellLink spell={TALENTS.SCOURGE_STRIKE_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.APOCALYPSE_TALENT} />.
        </p>
        <p>
          You can only stack up to {MAX_WOUNDS} wounds on a target. Applying more than that wastes
          them, so try to stay below the cap. Aim to have 4–6 wounds before casting{' '}
          <SpellLink spell={TALENTS.APOCALYPSE_TALENT} /> to get full value from the cooldown.
        </p>
        <p>
          This module shows how many wounds you applied and how many were wasted by overcapping or
          misusing cooldowns. Keeping your wounds under control is key to smooth, effective damage.
        </p>
      </div>
    );

    const data = (
      <RoundedPanel>
        <div style={{ padding: '15px' }}>
          <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
            Festering Wound Efficiency
          </div>

          {/* Efficiency Bar */}
          <div style={{ marginBottom: '15px' }}>
            <div
              style={{
                position: 'relative',
                height: '24px',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${this.woundEfficiency}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${barColor} 0%, ${barColor}dd 100%)`,
                  boxShadow: `0 0 10px ${barColor}66`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '80%',
                  top: 0,
                  width: '2px',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '90%',
                  top: 0,
                  width: '2px',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '95%',
                  top: 0,
                  width: '2px',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
              }}
            >
              <span>{this.woundEfficiency.toFixed(1)}% efficiency</span>
              <PerformanceMark perf={this.performanceLevel} />
            </div>
          </div>

          {/* Statistics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '14px',
            }}
          >
            <div>
              <div style={{ color: '#888' }}>Wounds Applied</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{this.totalWoundsApplied}</div>
            </div>
            <div>
              <div style={{ color: '#888' }}>Wounds Wasted</div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: this.wastedWounds > 0 ? '#ff6b6b' : '#0f0',
                }}
              >
                {this.wastedWounds}
              </div>
            </div>
          </div>

          {/* Warnings */}
          {this.wastedWounds > 0 && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px',
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              ⚠️ You wasted {this.wastedWounds} wounds by applying Festering Strike to targets at or
              near {MAX_WOUNDS} stacks
            </div>
          )}

          {this.apocalypseWoundsWasted > 0 && (
            <div
              style={{
                marginTop: '5px',
                padding: '8px',
                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              ⚠️ Cast Apocalypse {this.apocalypseWoundsWasted} times with fewer than 4 wounds
            </div>
          )}
        </div>
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data, 50);
  }

  private getBarColor(): string {
    const efficiency = this.woundEfficiency;
    if (efficiency >= 95) return '#00ff88';
    if (efficiency >= 90) return '#00ff00';
    if (efficiency >= 80) return '#ffbb00';
    return '#ff0000';
  }
}

export default WoundTracker;
