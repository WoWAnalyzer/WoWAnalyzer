import SPELLS from 'common/SPELLS/deathknight';
import { defineMessage } from '@lingui/core/macro';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { SpellIcon, TooltipElement, SpellLink } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { PerformanceMark } from 'interface/guide';

const BUFF_DURATION_MS = 10000; // Duration after which Sudden Doom procs expire (10s in-game)

class SuddenDoom extends Analyzer {
  wastedProcs = 0;
  totalProcs = 0;
  lastProcTime = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRemoveBuff,
    );
  }

  onBuff(event: ApplyBuffEvent) {
    this.lastProcTime = event.timestamp;
    this.totalProcs += 1;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    const durationHeld = event.timestamp - this.lastProcTime;
    if (durationHeld > BUFF_DURATION_MS) {
      this.wastedProcs += 1;
    }
  }

  onRefreshBuff() {
    this.wastedProcs += 1;
    this.totalProcs += 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedProcs,
      isGreaterThan: {
        minor: 0,
        average: 2,
        major: 4,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get suddenDoomEfficiency() {
    if (this.totalProcs === 0) {
      return 100;
    }
    return ((this.totalProcs - this.wastedProcs) / this.totalProcs) * 100;
  }

  get performanceLevel(): QualitativePerformance {
    const efficiency = this.suddenDoomEfficiency;
    if (efficiency >= 95) return QualitativePerformance.Perfect;
    if (efficiency >= 85) return QualitativePerformance.Good;
    if (efficiency >= 70) return QualitativePerformance.Ok;
    return QualitativePerformance.Fail;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are wasting <SpellLink spell={SPELLS.SUDDEN_DOOM_BUFF} /> procs. It is important to
          cast <SpellLink spell={SPELLS.DEATH_COIL} /> when{' '}
          <SpellLink spell={SPELLS.SUDDEN_DOOM_BUFF} /> procs.
        </>,
      )
        .icon(SPELLS.SUDDEN_DOOM_BUFF.icon)
        .actual(
          defineMessage({
            id: 'deathknight.unholy.suggestions.suddendoom.wastedProcs',
            message: `${this.wastedProcs} procs were refreshed or expired without being used`,
          }),
        )
        .recommended(`<${recommended} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        tooltip={`You got ${this.totalProcs} Sudden Doom procs and wasted ${this.wastedProcs}. A proc counts as wasted if it fades without being used or if it refreshes.`}
      >
        <BoringSpellValueText spell={SPELLS.SUDDEN_DOOM_BUFF}>
          <>
            {this.suddenDoomEfficiency.toFixed(0)}% <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection() {
    const goodProcs = this.totalProcs - this.wastedProcs;
    const barColor = this.getBarColor();

    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.SUDDEN_DOOM_BUFF} />
        </b>{' '}
        makes your auto attacks have a chance to grant a free{' '}
        <SpellLink spell={SPELLS.DEATH_COIL} /> that deals extra damage. You should use these procs
        before they expire or get overwritten.
      </p>
    );

    // Create a usage bar similar to RimeEfficiency
    const usageBar = (
      <RoundedPanel>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <div style={{ marginRight: '20px' }}>
            <SpellIcon spell={SPELLS.SUDDEN_DOOM_BUFF} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              Sudden Doom Efficiency
            </div>
            <div
              style={{
                position: 'relative',
                height: '24px',
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Background segments */}
              <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex' }}>
                <div
                  style={{
                    width: '70%',
                    backgroundColor: '#2a2a2a',
                    borderRight: '1px solid #444',
                  }}
                />
                <div
                  style={{ width: '15%', backgroundColor: '#333', borderRight: '1px solid #444' }}
                />
                <div
                  style={{
                    width: '10%',
                    backgroundColor: '#3a3a3a',
                    borderRight: '1px solid #444',
                  }}
                />
                <div style={{ width: '5%', backgroundColor: '#444' }} />
              </div>

              {/* Progress bar */}
              <div
                style={{
                  position: 'absolute',
                  width: `${this.suddenDoomEfficiency}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${barColor} 0%, ${barColor}dd 100%)`,
                  boxShadow: `0 0 10px ${barColor}66`,
                  transition: 'width 0.3s ease',
                }}
              />

              {/* Threshold markers */}
              <div
                style={{
                  position: 'absolute',
                  left: '70%',
                  top: 0,
                  width: '2px',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '85%',
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
                fontSize: '14px',
              }}
            >
              <div>
                <TooltipElement content={`${goodProcs} procs used out of ${this.totalProcs} total`}>
                  <span style={{ color: '#aaa' }}>
                    {goodProcs} / {this.totalProcs} used ({this.suddenDoomEfficiency.toFixed(1)}%)
                  </span>
                </TooltipElement>
              </div>
              <div>
                <PerformanceMark perf={this.performanceLevel} />
              </div>
            </div>

            {this.wastedProcs > 0 && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#ff6b6b' }}>
                ⚠️ {this.wastedProcs} procs wasted (expired or overwritten)
              </div>
            )}
          </div>
        </div>
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, usageBar, 50);
  }

  private getBarColor(): string {
    const efficiency = this.suddenDoomEfficiency;
    if (efficiency >= 95) return '#00ff88';
    if (efficiency >= 90) return '#00ff00';
    if (efficiency >= 80) return '#ffbb00';
    return '#ff0000';
  }
}

export default SuddenDoom;
