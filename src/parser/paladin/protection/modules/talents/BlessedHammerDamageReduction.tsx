import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import React from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import BoringSpellValue from 'parser/ui/BoringSpellValue';

class BlessedHammerDamageReduction extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  totalMeleeHits: number = 0;
  reducedDamageHits: number = 0;
  totalReducedDamage: number = 0;
  currentAttackPower: number | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackHitsToPlayer);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackCurrentAttackPower);
  }

  trackHitsToPlayer(event: DamageEvent): void {
    this.totalMeleeHits += 1;
    if (!event.sourceID || !this.enemies.enemies[event.sourceID]) {
      return;
    }
    const sourceIsDebuffed = this.enemies.enemies[event.sourceID].hasBuff(SPELLS.BLESSED_HAMMER_DEBUFF.id, event.timestamp, undefined, undefined, this.owner.playerId);
    if (sourceIsDebuffed) {
      this.reducedDamageHits += 1;
      this.totalReducedDamage += this.blessedHammerDamageReduction;
    }
  }

  trackCurrentAttackPower(event: DamageEvent) {
    if ('attackPower' in event && event.attackPower) {
      this.currentAttackPower = event.attackPower;
    }
  }

  get blessedHammerDamageReduction(): number {
    if (!this.currentAttackPower) {
      return 0;
    }
    return this.currentAttackPower * 30 / 100;
  }

  get averageHitReduction(): number {
    return this.totalReducedDamage / this.reducedDamageHits;
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            Average <b>{formatNumber(this.averageHitReduction)}</b> damage reduced per hit affected by <SpellLink id={SPELLS.BLESSED_HAMMER_TALENT.id} />.
          </>
        )}
      >
        <BoringSpellValue
          spell={SPELLS.BLESSED_HAMMER_TALENT}
          value={formatNumber(this.totalReducedDamage)}
          label={`Reduced damage from ${this.reducedDamageHits} hits.`}
        />
      </Statistic>
    );
  }
}

export default BlessedHammerDamageReduction;
