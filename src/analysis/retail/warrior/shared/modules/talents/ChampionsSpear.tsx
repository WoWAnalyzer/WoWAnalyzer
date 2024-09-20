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
import ChampionsMight from './ChampionsMight';

class ChampionsSpear extends Analyzer {
  static dependencies = {
    championsMight: ChampionsMight,
  };

  protected championsMight!: ChampionsMight;

  private championsSpearDamage: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CHAMPIONS_SPEAR_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CHAMPIONS_SPEAR_DAMAGE),
      this.onSpearDamage,
    );
  }

  onSpearDamage(event: DamageEvent) {
    this.championsSpearDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(1)}
        size="flexible"
        tooltip={
          <>
            <SpellLink spell={SPELLS.CHAMPIONS_SPEAR} /> dealt{' '}
            <strong>{formatNumber(this.championsSpearDamage)}</strong> total damage.{' '}
            {this.championsMight.increasedCritDamage() > 0 && (
              <div>
                <SpellLink spell={TALENTS.CHAMPIONS_MIGHT_TALENT} /> increased critical damage by{' '}
                <strong>{formatNumber(this.championsMight.increasedCritDamage())}</strong>.
              </div>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.CHAMPIONS_SPEAR_TALENT}>
          <DamageIcon />{' '}
          {this.owner.formatItemDamageDone(
            this.championsSpearDamage + this.championsMight.increasedCritDamage(),
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ChampionsSpear;
