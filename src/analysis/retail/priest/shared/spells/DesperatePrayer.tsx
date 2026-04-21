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
  absorbedHeal: number;
  overheal: number;
  runningHp: number;
}

const PERFECT_VALUE_FRACTION = 0.85;
const GOOD_VALUE_FRACTION = 0.5;
const OK_VALUE_FRACTION = 0.25;

class DesperatePrayer extends MajorDefensiveBuff.withDependencies({
  spellUsable: SpellUsable,
}) {
  hasLightsInspiration: boolean;
  hasDesperateMeasures: boolean;

  casts: DesperatePrayerCast[] = [];
  deathsWithDPReady = 0;
  private lastDamageTaken?: DamageEvent;

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
    // When the DP buff and heal fire on the same frame, event.maxHitPoints
    // can still reflect the pre-buff ceiling even though hitPoints already
    // includes the bonus. Fall back to hitPoints when that happens so the
    // post-buff max HP is correct.
    const postBuffMaxHp = Math.max(event.maxHitPoints ?? 0, event.hitPoints);
    const preCastMaxHp = postBuffMaxHp / (1 + this.maxHpBonus);
    const bonusHpPool = preCastMaxHp * this.maxHpBonus;
    // DP only raises the max-HP ceiling; current HP is unchanged until the
    // heal fires. So pre-cast HP equals HP right before this heal event.
    const preCastHp = Math.max(0, event.hitPoints - event.amount);
    this.casts.push({
      timestamp: event.timestamp,
      preCastMaxHp,
      hpPercentPreCast: preCastMaxHp > 0 ? preCastHp / preCastMaxHp : 0,
      bonusHpPool,
      bonusHpUsed: 0,
      effectiveHeal: event.amount,
      absorbedHeal: event.absorbed ?? 0,
      overheal: event.overheal ?? 0,
      runningHp: event.hitPoints,
    });
    // The heal itself is not damage, so we don't feed it to recordMitigation -
    // that would pollute `BreakdownByDamageSource` with Desperate Prayer as a
    // damage source. It's still counted toward the cast's overall value in
    // `explainPerformance` via `cast.effectiveHeal`.
  }

  private onDamageTaken(event: DamageEvent) {
    this.lastDamageTaken = event;
    if (!this.defensiveActive(event) || event.sourceIsFriendly) {
      return;
    }
    const cast = this.casts.at(-1);
    if (!cast) {
      return;
    }
    // The bonus "pool" isn't a shield - DP just raises max HP. Damage only
    // counts as pool absorption when it reduces HP from above the pre-cast
    // max toward it. If a damage event lacks hitPoints, fall back to our
    // running HP estimate so we don't just drop the event.
    const postHitHp = event.hitPoints ?? Math.max(0, cast.runningHp - event.amount);
    const preHitHp = event.hitPoints !== undefined ? postHitHp + event.amount : cast.runningHp;
    cast.runningHp = postHitHp;
    const bonusTop = cast.preCastMaxHp + cast.bonusHpPool;
    const damageInBonus = Math.max(
      0,
      Math.min(preHitHp, bonusTop) - Math.max(postHitHp, cast.preCastMaxHp),
    );
    const remaining = Math.max(0, cast.bonusHpPool - cast.bonusHpUsed);
    const usedFromPool = Math.min(remaining, damageInBonus);
    cast.bonusHpUsed += usedFromPool;
    // Always record the damage event so the breakdown shows damage sources
    // during the buff window, even when the pool absorbed nothing.
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
    if (!cast || cast.bonusHpPool <= 0) {
      return { perf: QualitativePerformance.Ok };
    }
    // Heal that fills the bonus HP territory is redundant - the bonus pool
    // already provides that effective HP. Only count heal up to what the
    // player was actually missing before the cast. Absorbed heal still counts.
    const preCastHp = cast.preCastMaxHp * cast.hpPercentPreCast;
    const preCastMissingHp = Math.max(0, cast.preCastMaxHp - preCastHp);
    const usefulHeal = Math.min(cast.effectiveHeal + cast.absorbedHeal, preCastMissingHp);
    // Max possible value = heal filling up to (missing HP capped at pool) +
    // pool fully absorbing. A cast at full HP tops out at just the pool, not
    // 2x pool, since there's no missing HP for the heal to usefully fill.
    const maxValue = Math.min(preCastMissingHp, cast.bonusHpPool) + cast.bonusHpPool;
    const valueFraction = (usefulHeal + cast.bonusHpUsed) / maxValue;
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
    if (this.deps.spellUsable.isOnCooldown(TALENTS.DESPERATE_PRAYER_TALENT.id)) {
      return;
    }
    const overkill = this.lastDamageTaken?.overkill ?? 0;
    const maxHp = this.lastDamageTaken?.maxHitPoints ?? 0;
    if (overkill > maxHp * this.maxHpBonus * 2) {
      return;
    }
    this.deathsWithDPReady += 1;
  }

  description(): ReactNode {
    const maxHpBonusPct = formatPercentage(this.maxHpBonus, 0);
    const duration = this.hasDesperateMeasures ? 20 : 10;
    return (
      <>
        <p>
          <SpellLink spell={TALENTS.DESPERATE_PRAYER_TALENT} /> increases your maximum health by{' '}
          {maxHpBonusPct}% for {duration} seconds and instantly heals you for that amount.
        </p>
        {this.hasLightsInspiration && (
          <p>
            <SpellLink spell={TALENTS.LIGHTS_INSPIRATION_TALENT} /> boosts the max health increase
            from 25% to 35%.
          </p>
        )}
        {this.hasDesperateMeasures && (
          <p>
            <SpellLink spell={TALENTS.DESPERATE_MEASURES_TALENT} /> extends the buff duration from
            10 to 20 seconds.
          </p>
        )}
      </>
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

  // Shared scale across both rows: the post-buff max HP (pre-cast max +
  // bonus pool). This way the bars always align visually, and the top of
  // the bar represents the maximum HP the player could have reached during
  // the buff.
  const maxHp = dpCast.preCastMaxHp;
  const currentHp = maxHp * dpCast.hpPercentPreCast;
  const totalScale = maxHp + dpCast.bonusHpPool;
  const normalHpEnd = totalScale > 0 ? maxHp / totalScale : 1;
  const hpFrac = totalScale > 0 ? currentHp / totalScale : 0;
  const healFrac = totalScale > 0 ? dpCast.effectiveHeal / totalScale : 0;
  const absorbedFrac = totalScale > 0 ? dpCast.absorbedHeal / totalScale : 0;
  const missingAfterHeal = Math.max(0, normalHpEnd - hpFrac - healFrac - absorbedFrac);
  // Hide the "missing HP" red segment when the heal was absorbed by a debuff
  const showMissingSegment = missingAfterHeal > 0 && dpCast.absorbedHeal === 0;
  const trailingFrac = Math.max(
    0,
    1 - hpFrac - healFrac - absorbedFrac - (showMissingSegment ? missingAfterHeal : 0),
  );
  const poolUsedFrac = totalScale > 0 ? dpCast.bonusHpUsed / totalScale : 0;
  const bonusTerritoryFrac = totalScale > 0 ? dpCast.bonusHpPool / totalScale : 0;

  return (
    <CooldownDetailsContainer>
      <table>
        <tbody>
          <tr>
            <td colSpan={3}>
              <strong>Usage info</strong>
            </td>
          </tr>
          <tr>
            <td>HP + Heal</td>
            <NumericColumn>
              {formatNumber(currentHp)}
              {dpCast.effectiveHeal > 0 && ` + ${formatNumber(dpCast.effectiveHeal)}`} (
              {formatPercentage(maxHp > 0 ? (currentHp + dpCast.effectiveHeal) / maxHp : 0, 0)}
              %){dpCast.absorbedHeal > 0 && ` + ${formatNumber(dpCast.absorbedHeal)} absorbed`}
              {dpCast.overheal > 0 && ` - ${formatNumber(dpCast.overheal)} wasted`}
            </NumericColumn>
            <TableSegmentContainer>
              {hpFrac > 0 && (
                <MitigationTooltipSegment color="rgb(80, 196, 76)" maxWidth={100} width={hpFrac} />
              )}
              {healFrac > 0 && (
                <MitigationTooltipSegment
                  color="rgb(128, 232, 120)"
                  maxWidth={100}
                  width={healFrac}
                />
              )}
              {absorbedFrac > 0 && (
                <MitigationTooltipSegment
                  color="rgb(155, 89, 182)"
                  maxWidth={100}
                  width={absorbedFrac}
                />
              )}
              {showMissingSegment && (
                <MitigationTooltipSegment
                  color="rgb(176, 28, 60)"
                  maxWidth={100}
                  width={missingAfterHeal}
                />
              )}
              {trailingFrac > 0 && (
                <MitigationTooltipSegment
                  color="rgba(255, 255, 255, 0.05)"
                  maxWidth={100}
                  width={trailingFrac}
                />
              )}
            </TableSegmentContainer>
          </tr>
          <tr>
            <td>Extra HP absorbed</td>
            <NumericColumn>
              {formatNumber(dpCast.bonusHpUsed)} (
              {formatPercentage(
                dpCast.bonusHpPool > 0 ? dpCast.bonusHpUsed / dpCast.bonusHpPool : 0,
                0,
              )}
              % of pool)
            </NumericColumn>
            <TableSegmentContainer>
              {normalHpEnd > 0 && (
                <MitigationTooltipSegment
                  color="rgba(80, 196, 76, 0.25)"
                  maxWidth={100}
                  width={normalHpEnd}
                />
              )}
              {poolUsedFrac > 0 && (
                <MitigationTooltipSegment
                  color="rgb(255, 193, 37)"
                  maxWidth={100}
                  width={poolUsedFrac}
                />
              )}
              {bonusTerritoryFrac - poolUsedFrac > 0 && (
                <MitigationTooltipSegment
                  color="rgba(255, 255, 255, 0.05)"
                  maxWidth={100}
                  width={Math.max(0, bonusTerritoryFrac - poolUsedFrac)}
                />
              )}
            </TableSegmentContainer>
          </tr>
        </tbody>
      </table>
      <BreakdownByDamageSource mit={mit} />
    </CooldownDetailsContainer>
  );
};

export default DesperatePrayer;
