import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class PhantomSingularity extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id);
  }

  statistic() {
    const spell = this.abilityTracker.getAbility(SPELLS.PHANTOM_SINGULARITY_TALENT.id);
    const damage = spell.damageEffective + spell.damageAbsorbed;
    const dps = (damage / this.owner.fightDuration) * 1000;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(damage)} damage`}
      >
        <BoringSpellValueText spellId={SPELLS.PHANTOM_SINGULARITY_TALENT.id}>
          {formatNumber(dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(damage))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PhantomSingularity;
