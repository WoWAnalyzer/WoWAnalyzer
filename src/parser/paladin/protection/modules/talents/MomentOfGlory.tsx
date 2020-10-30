import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { DamageEvent } from 'parser/core/Events';
import React from 'react';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { formatNumber } from 'common/format';
import SpellLink from 'common/SpellLink';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

const DAMAGE_MODIFIER = 0.2;

class MomentOfGlory extends Analyzer {
  damageBoostedHits: number = 0;
  totalExtraDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MOMENT_OF_GLORY_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AVENGERS_SHIELD), this.trackASDamage);
  }

  trackASDamage(event: DamageEvent): void {
    if (!this.selectedCombatant.hasBuff(SPELLS.MOMENT_OF_GLORY_TALENT.id, event.timestamp, undefined, undefined, this.owner.playerId)) {
      return;
    }
    this.damageBoostedHits += 1;
    this.totalExtraDamage += this.getBonusDamageFromMoG(event);
  }

  getBonusDamageFromMoG(event: DamageEvent): number {
    const baseDamageDone = event.amount + (event.absorbed || 0);
    return baseDamageDone - (baseDamageDone * (1 / (1 + DAMAGE_MODIFIER)));
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={(
          <>
            You hit <b>{formatNumber(this.damageBoostedHits)}</b> targets with a <SpellLink id={SPELLS.AVENGERS_SHIELD.id} /> boosted with <SpellLink id={SPELLS.MOMENT_OF_GLORY_TALENT.id} />.
          </>
        )}
      >
        <BoringSpellValue
          spell={SPELLS.MOMENT_OF_GLORY_TALENT}
          value={formatNumber(this.totalExtraDamage)}
          label="Extra Damage"
        />
      </Statistic>
    );
  }
}

export default MomentOfGlory;
