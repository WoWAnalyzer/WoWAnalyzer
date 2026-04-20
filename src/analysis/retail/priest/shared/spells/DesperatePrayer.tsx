import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import {
  BreakdownByDamageSource,
  CooldownDetailsContainer,
  NoData,
  NumericColumn,
  TableSegmentContainer,
} from 'interface/guide/components/MajorDefensives/AllCooldownUsagesList';
import {
  CooldownDetailsBuffProps,
  MajorDefensiveBuff,
  Mitigation,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { MitigationTooltipSegment } from 'interface/guide/components/MajorDefensives/MitigationSegments';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import SpellLink from 'interface/SpellLink';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

interface DesperatePrayerCast {
  timestamp: number;
  preCastMaxHp: number;
  hpPercentPreCast: number;
  bonusHpPool: number;
  bonusHpUsed: number;
  effectiveHeal: number;
}

const PERFECT_VALUE_FRACTION = 0.9;
const GOOD_VALUE_FRACTION = 0.5;
const OK_VALUE_FRACTION = 0.25;

class DesperatePrayer extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  hasLightsInspiration: boolean;
  hasDesperateMeasures: boolean;

  casts: DesperatePrayerCast[] = [];
  deathsWithDPReady = 0;

  constructor(options: Options) {
    super(TALENTS.DESPERATE_PRAYER_TALENT, buff(TALENTS.DESPERATE_PRAYER_TALENT), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DESPERATE_PRAYER_TALENT);
    this.hasLightsInspiration = this.selectedCombatant.hasTalent(TALENTS.LIGHTS_INSPIRATION_TALENT);
    this.hasDesperateMeasures = this.selectedCombatant.hasTalent(TALENTS.DESPERATE_MEASURES_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.to(SELECTED_PLAYER).spell(TALENTS.DESPERATE_PRAYER_TALENT),
      this.onHeal,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
    this.addEventListener(Events.death.to(SELECTED_PLAYER), this.onDeath);
  }

  private get maxHpBonus(): number {
    return this.hasLightsInspiration ? 0.35 : 0.25;
  }

  private onHeal(event: HealEvent) {
    const maxHitPoints = event.maxHitPoints ?? 0;
    const preCastMaxHp = maxHitPoints / (1 + this.maxHpBonus);
    const bonusHpPool = preCastMaxHp * this.maxHpBonus;
    const preHealHp = event.hitPoints - event.amount;
    const preCastHp = Math.max(0, preHealHp - bonusHpPool);
    this.casts.push({
      timestamp: event.timestamp,
      preCastMaxHp,
      hpPercentPreCast: preCastMaxHp > 0 ? preCastHp / preCastMaxHp : 0,
      bonusHpPool,
      bonusHpUsed: 0,
      effectiveHeal: event.amount,
    });
    // The heal itself is not damage, so we don't feed it to recordMitigation -
    // that would pollute `BreakdownByDamageSource` with Desperate Prayer as a
    // damage source. It's still counted toward the cast's overall value in
    // `explainPerformance` via `cast.effectiveHeal`.
  }

  private onDamageTaken(event: DamageEvent) {
    if (!this.defensiveActive || event.sourceIsFriendly) {
      return;
    }
    const cast = this.casts.at(-1);
    if (!cast) {
      return;
    }
    const remaining = Math.max(0, cast.bonusHpPool - cast.bonusHpUsed);
    if (remaining <= 0) {
      return;
    }
    const incoming = event.amount + (event.absorbed ?? 0);
    const usedFromPool = Math.min(remaining, incoming);
    cast.bonusHpUsed += usedFromPool;
    this.recordMitigation({
      event,
      mitigatedAmount: usedFromPool,
    });
  }

  private castForMitigation(
    mit: Mitigation<EventType.ApplyBuff, EventType.RemoveBuff>,
  ): DesperatePrayerCast | undefined {
    // The heal event fires shortly after applybuff, so cast.timestamp is
    // always slightly after mit.start.timestamp. Match the first cast at or
    // after the buff start but before the buff ends.
    return this.casts.find(
      (c) => c.timestamp >= mit.start.timestamp && c.timestamp <= mit.end.timestamp,
    );
  }

  explainPerformance(mit: Mitigation<EventType.ApplyBuff, EventType.RemoveBuff>): {
    perf: QualitativePerformance;
    explanation?: ReactNode;
  } {
    const cast = this.castForMitigation(mit);
    if (!cast) {
      return { perf: QualitativePerformance.Ok };
    }
    // Theoretical max: both the heal and the bonus HP pool fully realised.
    const maxValue = cast.bonusHpPool * 2;
    if (maxValue <= 0) {
      return { perf: QualitativePerformance.Ok };
    }
    const valueFraction = (cast.effectiveHeal + cast.bonusHpUsed) / maxValue;
    if (valueFraction >= PERFECT_VALUE_FRACTION) {
      return {
        perf: QualitativePerformance.Perfect,
        explanation: 'Heal + temporary HP pool were nearly fully utilised',
      };
    }
    if (valueFraction >= GOOD_VALUE_FRACTION) {
      return {
        perf: QualitativePerformance.Good,
        explanation: 'Most of the heal and/or temporary HP pool was consumed',
      };
    }
    if (valueFraction >= OK_VALUE_FRACTION) {
      return {
        perf: QualitativePerformance.Ok,
        explanation: 'Some of the heal or temporary HP pool went unused',
      };
    }
    return {
      perf: QualitativePerformance.Fail,
      explanation: 'Cast mostly overhealed and the temporary HP pool was unused',
    };
  }

  private onDeath() {
    if (!this.spellUsable.isOnCooldown(TALENTS.DESPERATE_PRAYER_TALENT.id)) {
      this.deathsWithDPReady += 1;
    }
  }

  description(): ReactNode {
    const maxHpBonusPct = this.hasLightsInspiration ? 35 : 25;
    const duration = this.hasDesperateMeasures ? 20 : 10;
    return (
      <p>
        <SpellLink spell={TALENTS.DESPERATE_PRAYER_TALENT} /> increases your maximum health by{' '}
        {maxHpBonusPct}% for {duration} seconds and instantly heals you for that amount.
        {this.hasLightsInspiration && (
          <>
            {' '}
            <SpellLink spell={TALENTS.LIGHTS_INSPIRATION_TALENT} /> boosts the max health increase
            from 25% to 35%.
          </>
        )}
        {this.hasDesperateMeasures && (
          <>
            {' '}
            <SpellLink spell={TALENTS.DESPERATE_MEASURES_TALENT} /> extends the buff duration from
            10 to 20 seconds.
          </>
        )}
      </p>
    );
  }

  statistic(): ReactNode {
    return (
      <MajorDefensiveStatistic
        analyzer={this}
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          this.deathsWithDPReady > 0
            ? `You died ${this.deathsWithDPReady} time${this.deathsWithDPReady === 1 ? '' : 's'} with Desperate Prayer ready.`
            : undefined
        }
      />
    );
  }

  get cooldownDetailsComponent() {
    return ({ mit }: CooldownDetailsBuffProps) => (
      <CooldownDetails mit={mit} dpCast={mit ? this.castForMitigation(mit) : undefined} />
    );
  }
}

const CooldownDetails = ({ mit, dpCast }: { mit?: Mitigation; dpCast?: DesperatePrayerCast }) => {
  if (!mit || !dpCast) {
    return (
      <CooldownDetailsContainer>
        <NoData>Click on a box in the cast breakdown to view details.</NoData>
      </CooldownDetailsContainer>
    );
  }
  // Scale dynamically to whichever is larger: normal max HP or the
  // total effective HP the player reached (currentHp + heal + pool
  // absorbed). This way row 3 fills completely when the bonus pool
  // was fully consumed, while rows 1/2 still have meaningful spacing
  // around the normal max HP marker.
  const maxHp = dpCast.preCastMaxHp;
  const currentHp = maxHp * dpCast.hpPercentPreCast;
  const totalReach = currentHp + dpCast.effectiveHeal + dpCast.bonusHpUsed;
  const totalScale = Math.max(maxHp, totalReach);
  const normalHpEnd = totalScale > 0 ? maxHp / totalScale : 1;
  const hpFrac = totalScale > 0 ? currentHp / totalScale : 0;
  const healFrac = totalScale > 0 ? dpCast.effectiveHeal / totalScale : 0;
  const poolFrac = totalScale > 0 ? dpCast.bonusHpUsed / totalScale : 0;
  const aboveNormalMax = Math.max(0, 1 - normalHpEnd);
  const missingAfterHeal = Math.max(0, normalHpEnd - hpFrac - healFrac);

  return (
    <CooldownDetailsContainer>
      <table>
        <tbody>
          <tr>
            <td colSpan={3}>
              <strong>Usage info</strong>
            </td>
          </tr>
          {<>
                ...    
          </>}
              <>
                <tr>
                  <td>HP before cast</td>
                  <NumericColumn>
                    {formatNumber(currentHp)} ({formatPercentage(dpCast.hpPercentPreCast, 0)}%)
                  </NumericColumn>
                  <TableSegmentContainer>
                    <MitigationTooltipSegment
                      color="rgb(80, 196, 76)"
                      maxWidth={100}
                      width={hpFrac}
                    />
                    <MitigationTooltipSegment
                      color="rgb(176, 28, 60)"
                      maxWidth={100}
                      width={normalHpEnd - hpFrac}
                    />
                    <MitigationTooltipSegment
                      color="rgba(255, 255, 255, 0.05)"
                      maxWidth={100}
                      width={aboveNormalMax}
                    />
                  </TableSegmentContainer>
                </tr>
                <tr>
                  <td>Heal</td>
                  <NumericColumn>
                    {formatNumber(dpCast.effectiveHeal)} (
                    {formatPercentage(
                      maxHp > 0 ? Math.min(1, (currentHp + dpCast.effectiveHeal) / maxHp) : 0,
                      0,
                    )}
                    %)
                  </NumericColumn>
                  <TableSegmentContainer>
                    <MitigationTooltipSegment
                      color="rgba(80, 196, 76, 0.25)"
                      maxWidth={100}
                      width={hpFrac}
                    />
                    <MitigationTooltipSegment
                      color="rgb(80, 196, 76)"
                      maxWidth={100}
                      width={healFrac}
                    />
                    <MitigationTooltipSegment
                      color="rgba(176, 28, 60, 0.25)"
                      maxWidth={100}
                      width={missingAfterHeal}
                    />
                    <MitigationTooltipSegment
                      color="rgba(255, 255, 255, 0.05)"
                      maxWidth={100}
                      width={aboveNormalMax}
                    />
                  </TableSegmentContainer>
                </tr>
                <tr>
                  <td>Extra HP absorbed</td>
                  <NumericColumn>
                    {formatNumber(dpCast.bonusHpUsed)} (
                    {formatPercentage(
                      maxHp > 0
                        ? (currentHp + dpCast.effectiveHeal + dpCast.bonusHpUsed) / maxHp
                        : 0,
                      0,
                    )}
                    %)
                  </NumericColumn>
                  <TableSegmentContainer>
                    <MitigationTooltipSegment
                      color="rgba(80, 196, 76, 0.25)"
                      maxWidth={100}
                      width={hpFrac + healFrac}
                    />
                    <MitigationTooltipSegment
                      color="rgb(255, 193, 37)"
                      maxWidth={100}
                      width={poolFrac}
                    />
                    <MitigationTooltipSegment
                      color="rgba(255, 255, 255, 0.05)"
                      maxWidth={100}
                      width={Math.max(0, 1 - hpFrac - healFrac - poolFrac)}
                    />
                  </TableSegmentContainer>
                </tr>
              </>
            );
          })()}
        </tbody>
      </table>
      <BreakdownByDamageSource mit={mit} />
    </CooldownDetailsContainer>
  );
};

export default DesperatePrayer;
