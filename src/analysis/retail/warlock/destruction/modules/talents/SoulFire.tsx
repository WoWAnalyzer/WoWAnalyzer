import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import SoulShardTracker from '../soulshards/SoulShardTracker';

const FRAGMENTS_PER_CHAOS_BOLT = 20;

class SoulFire extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    soulShardTracker: SoulShardTracker,
  };

  protected abilityTracker!: AbilityTracker;
  protected soulShardTracker!: SoulShardTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SOUL_FIRE_TALENT.id);
  }

  statistic() {
    const fragments = this.soulShardTracker.getGeneratedBySpell(TALENTS.SOUL_FIRE_TALENT.id);

    const chaosBolt = this.abilityTracker.getAbility(SPELLS.CHAOS_BOLT.id);
    const avg = (chaosBolt.damageEffective + chaosBolt.damageAbsorbed) / chaosBolt.casts || 0;
    const estimatedDamage = Math.floor(fragments / FRAGMENTS_PER_CHAOS_BOLT) * avg;

    const spell = this.abilityTracker.getAbility(TALENTS.SOUL_FIRE_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    const dps = (damage / this.owner.fightDuration) * 1000;

    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(damage)} damage
            <br />
            <br />
            If fragments generated with Soul Fire were used on Chaos Bolts, they would deal an
            estimated {formatThousands(estimatedDamage)} damage (
            {this.owner.formatItemDamageDone(estimatedDamage)}). This is estimated using average
            Chaos Bolt damage over the fight.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.SOUL_FIRE_TALENT.id}>
          {formatNumber(dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total
          </small>{' '}
          <br />
          {fragments} <small>generated Fragments</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulFire;
