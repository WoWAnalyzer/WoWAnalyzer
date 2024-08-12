import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const amp_exposure = 0.08;

class FaelineHarmony extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  protected enemies!: Enemies;
  protected combatants!: Combatants;

  totalDamage = 0;
  totalHealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = false;
    if (this.active) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET),
        this.onAffectedDamage,
      );
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET),
        this.onAffectedHealing,
      );
    }
  }
  onAffectedDamage(event: DamageEvent) {
    if (event.targetIsFriendly) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.FAELINE_HARMONY_DEBUFF.id)) {
      this.totalDamage += calculateEffectiveDamage(event, amp_exposure);
    }
  }
  onAffectedHealing(event: HealEvent) {
    if (!event.targetIsFriendly) {
      return;
    }
    const combatant = this.combatants.getEntity(event);
    if (combatant && combatant.hasBuff(SPELLS.FAELINE_HARMONY_BUFF.id)) {
      this.totalHealing += calculateEffectiveHealing(event, amp_exposure);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This shows the HPS and DPS provided by the {formatPercentage(amp_exposure)}% increase
            from Faeline Harmony.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.FAELINE_HARMONY_DEBUFF}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
        <BoringSpellValueText spell={SPELLS.FAELINE_HARMONY_BUFF}>
          <ItemHealingDone amount={this.totalHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FaelineHarmony;
