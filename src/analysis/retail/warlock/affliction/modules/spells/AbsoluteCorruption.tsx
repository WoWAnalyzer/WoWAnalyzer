import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const AC_DAMAGE_BONUS = 0.15;

class AbsoluteCorruption extends Analyzer {
  get dps() {
    return (this.bonusDmg / this.owner.fightDuration) * 1000;
  }

  bonusDmg = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ABSOLUTE_CORRUPTION_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CORRUPTION_DEBUFF),
      this.onCorruptionDamage,
    );
  }

  onCorruptionDamage(event: DamageEvent) {
    this.bonusDmg += calculateEffectiveDamage(event, AC_DAMAGE_BONUS);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            {formatThousands(this.bonusDmg)} bonus damage
            <br />
            <br />
            Note: This only accounts for the passive 15% increased damage of Corruption. Actual
            bonus damage should be higher due to saved GCDs.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.ABSOLUTE_CORRUPTION_TALENT.id}>
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AbsoluteCorruption;
