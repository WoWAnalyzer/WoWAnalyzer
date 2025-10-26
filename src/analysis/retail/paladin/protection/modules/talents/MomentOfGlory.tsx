import { formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { ReactNode } from 'react';
import SpellUsable from '../features/SpellUsable';

const DAMAGE_MODIFIER = 0.2;
const MOG_CDR = 15000 * 0.75;

class MomentOfGlory extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  damageBoostedHits = 0;
  totalExtraDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.MOMENT_OF_GLORY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.AVENGERS_SHIELD_TALENT),
      this.trackASDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.AVENGERS_SHIELD_TALENT),
      this.reduceCooldown,
    );
  }

  private reduceCooldown() {
    if (this.selectedCombatant.hasBuff(TALENTS.MOMENT_OF_GLORY_TALENT.id)) {
      this.deps.spellUsable.reduceCooldown(TALENTS.AVENGERS_SHIELD_TALENT.id, MOG_CDR);
    }
  }

  trackASDamage(event: DamageEvent): void {
    if (
      !this.selectedCombatant.hasBuff(
        TALENTS.MOMENT_OF_GLORY_TALENT.id,
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

  statistic(): ReactNode {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You hit <b>{formatNumber(this.damageBoostedHits)}</b> targets with a{' '}
            <SpellLink spell={TALENTS.AVENGERS_SHIELD_TALENT} /> boosted with{' '}
            <SpellLink spell={TALENTS.MOMENT_OF_GLORY_TALENT} />.
          </>
        }
      >
        <BoringSpellValue
          spell={TALENTS.MOMENT_OF_GLORY_TALENT.id}
          value={formatNumber(this.totalExtraDamage)}
          label="Extra Damage"
        />
      </Statistic>
    );
  }
}

export default MomentOfGlory;
