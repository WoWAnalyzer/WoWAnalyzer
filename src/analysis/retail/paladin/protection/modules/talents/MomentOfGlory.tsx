import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import * as React from 'react';

const DAMAGE_MODIFIER = 0.2;

class MomentOfGlory extends Analyzer {
  damageBoostedHits: number = 0;
  totalExtraDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MOMENT_OF_GLORY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.AVENGERS_SHIELD),
      this.trackASDamage,
    );
  }

  trackASDamage(event: DamageEvent): void {
    if (
      !this.selectedCombatant.hasBuff(
        SPELLS.MOMENT_OF_GLORY_TALENT.id,
        event.timestamp,
        undefined,
        undefined,
        this.owner.playerId,
      )
    ) {
      return;
    }
    this.damageBoostedHits += 1;
    this.totalExtraDamage += this.getBonusDamageFromMoG(event);
  }

  getBonusDamageFromMoG(event: DamageEvent): number {
    const baseDamageDone = event.amount + (event.absorbed || 0);
    return baseDamageDone - baseDamageDone * (1 / (1 + DAMAGE_MODIFIER));
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You hit <b>{formatNumber(this.damageBoostedHits)}</b> targets with a{' '}
            <SpellLink id={SPELLS.AVENGERS_SHIELD.id} /> boosted with{' '}
            <SpellLink id={SPELLS.MOMENT_OF_GLORY_TALENT.id} />.
          </>
        }
      >
        <BoringSpellValue
          spellId={SPELLS.MOMENT_OF_GLORY_TALENT.id}
          value={formatNumber(this.totalExtraDamage)}
          label="Extra Damage"
        />
      </Statistic>
    );
  }
}

export default MomentOfGlory;
