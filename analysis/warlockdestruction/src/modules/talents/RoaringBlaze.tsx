import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';

/*
  Roaring Blaze (Tier 90 Destruction talent):
    Conflagrate burns the target for an additional (48% of Spell power) Fire damage over 6 sec.
 */
class RoaringBlaze extends Analyzer {
  get dps() {
    return (this.damage / this.owner.fightDuration) * 1000;
  }

  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ROARING_BLAZE_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ROARING_BLAZE_DAMAGE),
      this.onRoaringBlazeDamage,
    );
  }

  onRoaringBlazeDamage(event: DamageEvent) {
    this.damage += (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="small"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spellId={SPELLS.ROARING_BLAZE_TALENT.id}>
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RoaringBlaze;
