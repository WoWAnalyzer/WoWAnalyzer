import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { defineMessage } from '@lingui/core/macro';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { formatPercentage } from 'common/format';
import { SpellLink, SpellIcon, TooltipElement } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies, { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class VirulentPlagueEfficiency extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  private targets: Record<string, number> = {};

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE),
      this.onRefresh,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE),
      this.onApply,
    );
  }

  get Uptime() {
    return this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;
  }

  get UptimeSuggestionThresholds() {
    const isVpImportant =
      this.selectedCombatant.hasTalent(TALENTS.EBON_FEVER_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.SUPERSTRAIN_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.PLAGUEBRINGER_TALENT);

    return isVpImportant
      ? {
          actual: this.Uptime,
          isLessThan: {
            minor: 0.9,
            average: 0.8,
            major: 0.7,
          },
          style: ThresholdStyle.PERCENTAGE,
        }
      : {
          actual: this.Uptime,
          isLessThan: {
            minor: 0.85,
          },
          style: ThresholdStyle.PERCENTAGE,
        };
  }

  get VirulentDuration() {
    return this.selectedCombatant.hasTalent(TALENTS.EBON_FEVER_TALENT) ? 13.65 : 27.3;
  }

  onRefresh(event: RefreshDebuffEvent) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] =
      event.timestamp + 1000 * this.VirulentDuration;
  }

  onApply(event: ApplyDebuffEvent) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] =
      event.timestamp + 1000 * this.VirulentDuration - 1000 * 0.3 * this.VirulentDuration;
    //Removing 3.15 seconds when buff is only applied. This is for cases when the target does not benefit from the epidemic effect (Dots spreading to adds not staying by target for instance.)
  }

  suggestions(when: When) {
    when(this.UptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink spell={SPELLS.VIRULENT_PLAGUE} /> uptime can be improved. Try to pay
          attention to when Virulent Plague is about to fall off the priority target, using{' '}
          <SpellLink spell={SPELLS.OUTBREAK} /> to refresh Virulent Plague. Using a debuff tracker
          can help.
        </span>,
      )
        .icon(SPELLS.VIRULENT_PLAGUE.icon)
        .actual(
          defineMessage({
            id: 'deathknight.unholy.suggestions.virulentPlague.uptime',
            message: `${formatPercentage(actual)}% Virulent Plague uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(7)} size="flexible">
        <BoringSpellValueText spell={SPELLS.VIRULENT_PLAGUE.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.Uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection() {
    const uptime = this.Uptime;
    const uptimePercentage = uptime * 100; // Convert to percentage
    const barColor = this.getBarColor(uptimePercentage);

    const explanation = (
      <p>
        <b>
          <SpellLink spell={SPELLS.VIRULENT_PLAGUE} />
        </b>{' '}
        is a plague that deals damage over time and is a key part of your rotation.
      </p>
    );

    // Create a usage bar similar to RimeEfficiency
    const usageBar = (
      <RoundedPanel>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <div style={{ marginRight: '20px' }}>
            <SpellIcon spell={SPELLS.VIRULENT_PLAGUE} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              Virulent Plague Uptime
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

              {/* Progress bar - THIS IS THE FIX FOR LINE 233 */}
              <div
                style={{
                  position: 'absolute',
                  width: `${uptimePercentage}%`,
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
                <TooltipElement
                  content={`Virulent Plague was active for ${formatPercentage(uptime)} of the fight duration.`}
                >
                  <span style={{ color: '#aaa' }}>{formatPercentage(uptime)} uptime</span>
                </TooltipElement>
              </div>
              <div>
                <PerformanceMark perf={this.getPerformanceLevel(uptimePercentage)} />
              </div>
            </div>

            {uptime < 0.85 && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#ff6b6b' }}>
                ⚠️ Try to maintain higher uptime using Outbreak to refresh
              </div>
            )}
          </div>
        </div>
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, usageBar, 50);
  }

  private getBarColor(uptimePercentage: number): string {
    if (uptimePercentage >= 95) return '#00ff88';
    if (uptimePercentage >= 85) return '#00ff00';
    if (uptimePercentage >= 70) return '#ffbb00';
    return '#ff0000';
  }

  private getPerformanceLevel(uptimePercentage: number): QualitativePerformance {
    if (uptimePercentage >= 95) return QualitativePerformance.Perfect;
    if (uptimePercentage >= 85) return QualitativePerformance.Good;
    if (uptimePercentage >= 70) return QualitativePerformance.Ok;
    return QualitativePerformance.Fail;
  }
}

export default VirulentPlagueEfficiency;
