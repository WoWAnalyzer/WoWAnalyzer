import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import { DamageIcon } from 'interface/icons';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import ElysianMight from './ElysianMight';

class SpearOfBastion extends Analyzer {
  static dependencies = {
    elysianMight: ElysianMight,
  };

  protected elysianMight!: ElysianMight;

  private spearOfBastionDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPEAR_OF_BASTION_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SPEAR_OF_BASTION_DAMAGE),
      this.onSpearDamage,
    );
  }

  onSpearDamage(event: DamageEvent) {
    this.spearOfBastionDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={
          <>
            <SpellLink spell={SPELLS.SPEAR_OF_BASTION} /> dealt{' '}
            <strong>{formatNumber(this.spearOfBastionDamage)}</strong> total damage.{' '}
            {this.elysianMight.increasedCritDamage() > 0 && (
              <div>
                <SpellLink spell={TALENTS.ELYSIAN_MIGHT_TALENT} /> increased critical damage by{' '}
                <strong>{formatNumber(this.elysianMight.increasedCritDamage())}</strong>.
              </div>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.SPEAR_OF_BASTION_TALENT}>
          <DamageIcon />{' '}
          {this.owner.formatItemDamageDone(
            this.spearOfBastionDamage + this.elysianMight.increasedCritDamage(),
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SpearOfBastion;
