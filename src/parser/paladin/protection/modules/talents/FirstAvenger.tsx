import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import React from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import BoringSpellValue from 'parser/ui/BoringSpellValue';

// One second bounce buffer for AS to bounce around and hit targets.
const AVENGERS_SHIELD_BOUNCE_BUFFER: number = 1000;
const TALENTLESS_NUM_OF_BOUNCES = 3;

class FirstAvenger extends Analyzer {
  lastAvengersShieldCastTimestamp: number = 0;
  totalNumHits: number = 0;
  totalNumCasts: number = 0;
  castToHitsMap: Map<number, DamageEvent[]> = new Map<number, DamageEvent[]>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FIRST_AVENGER_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVENGERS_SHIELD), this.trackAvengersShieldCasts);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AVENGERS_SHIELD), this.trackAvengersShieldHits);
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
      const hits: DamageEvent[] | undefined = this.castToHitsMap.get(this.lastAvengersShieldCastTimestamp);
      if (hits !== undefined) {
        hits.push(event);
      }
    }
  }

  getExtraDamageForCast(castTimestamp: number): number {
    if (!this.castToHitsMap.has(castTimestamp)) {
      return 0;
    }
    const hits: DamageEvent[] | undefined = this.castToHitsMap.get(castTimestamp);
    if (hits === undefined) {
      return 0;
    }
    const numExtraHits = hits.length > TALENTLESS_NUM_OF_BOUNCES ? hits.length - TALENTLESS_NUM_OF_BOUNCES : 0;
    return (hits.map((damageEvent) => damageEvent.amount + (damageEvent.absorbed || 0))
                .reduce((prev, current) => prev + current, 0) / hits.length)
            * numExtraHits;
  }

  get averageHitsPerCast(): number {
    return this.totalNumHits / this.totalNumCasts;
  }

  get totalExtraDamage(): number {
    return Array.from(this.castToHitsMap.keys())
                  .map((castTimestamp) => this.getExtraDamageForCast(castTimestamp))
                  .reduce((prev, current) => prev + current, 0);
  }

  get averageExtraDamage(): number {
    return this.totalExtraDamage / this.totalNumCasts;
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
              You hit on average <b>{formatNumber(this.averageHitsPerCast)}</b> enemies per cast of <SpellLink id={SPELLS.AVENGERS_SHIELD.id} /><br />
              The extra hits from taking First Avenger contributed <b>{formatNumber(this.totalExtraDamage)}</b> total extra damage.
          </>
        )}
      >
        <BoringSpellValue
          spell={SPELLS.FIRST_AVENGER_TALENT}
          value={formatNumber(this.averageExtraDamage)}
          label={(
            <>
              Average extra damage per cast of <SpellLink id={SPELLS.AVENGERS_SHIELD.id} />.
            </>
          )}
        />
      </Statistic>
    );
  }
}

export default FirstAvenger;
