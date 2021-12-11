import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const amp_exposure = 0.08;

class FaelineHarmonydmg extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FAELINE_HARMONY.bonusID);
    if (this.active) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET),
        this.onAffectedDamage,
      );
    }
  }
  onAffectedDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    const target = this.enemies.getEntity(event);
    if (target !== null && target.hasBuff(SPELLS.FAELINE_HARMONY_DEBUFF.id, event.timestamp)) {
      this.totalDamage += calculateEffectiveDamage(event, amp_exposure);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            Total damage done by the {formatPercentage(amp_exposure)}% increase from  Faeline Harmony: {formatNumber(this.totalDamage)}
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.FAELINE_HARMONY_DEBUFF.id}>
          <ItemDamageDone amount={this.totalDamage}/>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FaelineHarmonydmg;
