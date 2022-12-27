import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

// Example Log: https://www.warcraftlogs.com/reports/NcRzTFqvyxaYDMBb#fight=8&type=healing&source=7
class ImpendingVicory extends Analyzer {
  totalDamage: number = 0;
  totalHeal: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.IMPENDING_VICTORY_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.IMPENDING_VICTORY_TALENT_HEAL),
      this.onImpendingVictoryHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(talents.IMPENDING_VICTORY_TALENT),
      this.onImpendingVictoryDamage,
    );
  }

  get percentageDamage() {
    return this.owner.getPercentageOfTotalDamageDone(this.totalDamage);
  }

  onImpendingVictoryDamage(event: DamageEvent) {
    this.totalDamage += event.amount + (event.absorbed || 0);
  }

  onImpendingVictoryHeal(event: HealEvent) {
    this.totalHeal += event.amount;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <strong>
              {formatThousands(this.totalDamage)} ({formatPercentage(this.percentageDamage)}%)
            </strong>{' '}
            damage was done by Impending Victory.
          </>
        }
      >
        <BoringSpellValueText spellId={talents.IMPENDING_VICTORY_TALENT.id}>
          <>{formatNumber(this.totalHeal)} Healing</>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ImpendingVicory;
