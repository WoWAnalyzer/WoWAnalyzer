import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { FightEndEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellIcon, SpellLink, TooltipElement } from 'interface';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { PerformanceMark } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

const SOUL_REAPER_EXECUTE_RANGE = 0.35;

class SoulReaper extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = SOUL_REAPER_EXECUTE_RANGE;
  static countCooldownAsExecuteTime = true;

  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts = 0;
  totalCastsInExecute = 0;

  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SOUL_REAPER_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.fightend, this.adjustMaxCasts);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SOUL_REAPER_TALENT),
      () => this.totalCastsInExecute++,
    );

    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(TALENTS.SOUL_REAPER_TALENT);
    ctor.executeSpells.push(SPELLS.SOUL_REAPER_TALENT_SECOND_HIT);

    (options.abilities as Abilities).add({
      spell: TALENTS.SOUL_REAPER_TALENT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: 6,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts,
        extraSuggestion:
          ' (This module only starts tracking possible casts once you damage a target with 35% or less health)',
      },
    });
  }

  adjustMaxCasts(event: FightEndEvent) {
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(this.totalExecuteDuration / 6000);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.SOUL_REAPER_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection() {
    const actual = this.totalCastsInExecute;
    const possible = this.maxCasts;
    const efficiency = possible === 0 ? 100 : (actual / possible) * 100;
    const barColor =
      efficiency >= 95
        ? '#00ff88'
        : efficiency >= 90
          ? '#00ff00'
          : efficiency >= 80
            ? '#ffbb00'
            : '#ff0000';

    const explanation = (
      <p>
        <b>
          <SpellLink spell={TALENTS.SOUL_REAPER_TALENT} />
        </b>{' '}
        should ideally explode (proc) during execute. Procs only happen if the target is under 35%
        HP and survives the debuff.
      </p>
    );

    const usageBar = (
      <RoundedPanel>
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px' }}>
          <div style={{ marginRight: '20px' }}>
            <SpellIcon spell={TALENTS.SOUL_REAPER_TALENT} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
              Soul Reaper Efficiency
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
              <div
                style={{
                  position: 'absolute',
                  width: `${efficiency}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${barColor} 0%, ${barColor}dd 100%)`,
                  boxShadow: `0 0 10px ${barColor}66`,
                  transition: 'width 0.3s ease',
                }}
              />
              {[70, 85, 95].map((pct) => (
                <div
                  key={pct}
                  style={{
                    position: 'absolute',
                    left: `${pct}%`,
                    top: 0,
                    width: '2px',
                    height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
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
                  content={`${actual} Soul Reaper casts in execute phase out of ${possible} total`}
                >
                  <span style={{ color: '#aaa' }}>
                    {actual} / {possible} procced ({efficiency.toFixed(1)}%)
                  </span>
                </TooltipElement>
              </div>
              <div>
                <PerformanceMark
                  perf={
                    efficiency >= 95
                      ? QualitativePerformance.Perfect
                      : efficiency >= 85
                        ? QualitativePerformance.Good
                        : efficiency >= 70
                          ? QualitativePerformance.Ok
                          : QualitativePerformance.Fail
                  }
                />
              </div>
            </div>
            {actual < possible && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#ff6b6b' }}>
                ⚠️ {possible - actual} Soul Reaper casts were missed during execute phase.
              </div>
            )}
          </div>
        </div>
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, usageBar, 50);
  }
}

export default SoulReaper;
