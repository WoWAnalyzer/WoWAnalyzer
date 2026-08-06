import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent, CastEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { ReactNode } from 'react';

class Redoubt extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  private currentHP: number = 0;
  private maxHP: number = 0;
  private totalExtraArmor: number = 0;
  private sotrCasts: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.REDOUBT_TALENT);
    if (!this.active) {
      return;
    }

    // Track HP from any event that provides hit points
    this.addEventListener(Events.any, this.trackHP);

    // Track Shield of the Righteous casts
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHIELD_OF_THE_RIGHTEOUS),
      this.onSotrCast,
    );
  }

  trackHP(event: AnyEvent) {
    if (
      'hitPoints' in event &&
      event.hitPoints !== undefined &&
      'maxHitPoints' in event &&
      event.maxHitPoints !== undefined
    ) {
      this.currentHP = event.hitPoints;
      this.maxHP = event.maxHitPoints;
    }
  }

  onSotrCast(event: CastEvent) {
    if (this.maxHP === 0) {
      // No HP info yet – skip this cast
      return;
    }

    const missingHealthPercent = 1 - this.currentHP / this.maxHP;
    const strength = this.statTracker.currentStrengthRating;
    const baseArmor = 0.75 * strength; // Shield of the Righteous increases armor by 75% of Strength
    const extraArmor = baseArmor * 0.5 * missingHealthPercent; // Redoubt adds up to 50% extra armor
    this.totalExtraArmor += extraArmor;
    this.sotrCasts += 1;
  }

  get averageExtraArmor(): number {
    return this.sotrCasts === 0 ? 0 : this.totalExtraArmor / this.sotrCasts;
  }

  statistic(): ReactNode {
    if (!this.active) {
      return null;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Shield of the Righteous's armor increase is enhanced by Redoubt by up to 50% based on
            missing health.
            <br />
            Total extra armor contributed: {formatNumber(this.totalExtraArmor)}
            <br />
            Average extra armor per SotR cast: {formatNumber(this.averageExtraArmor)}
          </>
        }
      >
        <BoringSpellValue
          spell={TALENTS.REDOUBT_TALENT.id}
          value={formatNumber(this.totalExtraArmor)}
          label="Total Extra Armor"
        />
      </Statistic>
    );
  }
}

export default Redoubt;
