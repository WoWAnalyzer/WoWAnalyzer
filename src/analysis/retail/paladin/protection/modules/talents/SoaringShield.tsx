import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { ReactNode } from 'react';

// One second bounce buffer for AS to bounce around and hit targets.
const AVENGERS_SHIELD_BOUNCE_BUFFER = 1000;
const BASELINE_BOUNCES = 3; // Initial hit + 2 baseline bounces

class SoaringShield extends Analyzer {
  lastAvengersShieldCastTimestamp = 0;
  totalNumHits = 0;
  totalNumCasts = 0;
  castToHitsMap: Map<number, DamageEvent[]> = new Map<number, DamageEvent[]>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SOARING_SHIELD_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.AVENGERS_SHIELD_TALENT),
      this.trackAvengersShieldCasts,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.AVENGERS_SHIELD_TALENT),
      this.trackAvengersShieldHits,
    );
  }

  trackAvengersShieldCasts(event: CastEvent): void {
    this.lastAvengersShieldCastTimestamp = event.timestamp;
    this.totalNumCasts += 1;
  }

  trackAvengersShieldHits(event: DamageEvent): void {
    if (event.timestamp - this.lastAvengersShieldCastTimestamp < AVENGERS_SHIELD_BOUNCE_BUFFER) {
      if (!this.castToHitsMap.has(this.lastAvengersShieldCastTimestamp)) {
        this.castToHitsMap.set(this.lastAvengersShieldCastTimestamp, []);
      }
      this.totalNumHits += 1;
      const hits = this.castToHitsMap.get(this.lastAvengersShieldCastTimestamp);
      if (hits !== undefined) {
        hits.push(event);
      }
    }
  }

  getExtraDamageForCast(castTimestamp: number): number {
    const hits = this.castToHitsMap.get(castTimestamp);
    if (!hits || hits.length === 0) {
      return 0;
    }
    const numExtraHits = Math.max(0, hits.length - BASELINE_BOUNCES);
    const averageHitDamage =
      hits.reduce((sum, dmg) => sum + dmg.amount + (dmg.absorbed || 0), 0) / hits.length;
    return averageHitDamage * numExtraHits;
  }

  get averageHitsPerCast(): number {
    return this.totalNumCasts === 0 ? 0 : this.totalNumHits / this.totalNumCasts;
  }

  get totalExtraDamage(): number {
    return Array.from(this.castToHitsMap.keys())
      .map((castTimestamp) => this.getExtraDamageForCast(castTimestamp))
      .reduce((prev, current) => prev + current, 0);
  }

  get averageExtraDamage(): number {
    return this.totalNumCasts === 0 ? 0 : this.totalExtraDamage / this.totalNumCasts;
  }

  statistic(): ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You hit on average <b>{formatNumber(this.averageHitsPerCast)}</b> enemies per cast of{' '}
            <SpellLink spell={TALENTS.AVENGERS_SHIELD_TALENT} />
            <br />
            The extra hits from <SpellLink spell={TALENTS.SOARING_SHIELD_TALENT} /> contributed{' '}
            <b>{formatNumber(this.totalExtraDamage)}</b> total extra damage.
          </>
        }
      >
        <BoringSpellValue
          spell={TALENTS.SOARING_SHIELD_TALENT.id}
          value={formatNumber(this.averageExtraDamage)}
          label={
            <>
              Average extra damage per cast of <SpellLink spell={TALENTS.SOARING_SHIELD_TALENT} />.
            </>
          }
        />
      </Statistic>
    );
  }
}

export default SoaringShield;
