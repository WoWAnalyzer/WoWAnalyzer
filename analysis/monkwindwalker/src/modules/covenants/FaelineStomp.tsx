import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const MOD = 0.08;

class FaelineStompWindwalker extends Analyzer {
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
      this.totalDamage += calculateEffectiveDamage(event, MOD);
    }
  }
  get dps() {
    return (this.totalDamage / this.owner.fightDuration) * 1000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            Total damage done by the 8% increase: {formatNumber(this.totalDamage)}
            <br />
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.FAELINE_HARMONY_DEBUFF.id}>
          <img src="/img/sword.png" alt="Damage" className="icon" /> {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamage))} % of
            total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FaelineStompWindwalker;
