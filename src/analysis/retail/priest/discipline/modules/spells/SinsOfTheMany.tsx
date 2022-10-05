import AtonementAnalyzer, {
  AtonementAnalyzerEvent,
} from 'analysis/retail/priest/discipline/modules/core/AtonementAnalyzer';
import { formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage, calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Atonement from './Atonement';

const SINS_OF_THE_MANY_FLOOR_BONUS = 0.03;

/**
 * Sins isn't linear,
 * it allows you to have one Atonement active whilst keeping the full bonus
 * from the passive and from 6 onwards it only decreases 0.005.
 * Hence this map with the values for each Atonement count.
 */
const BONUS_DAMAGE_ARRAY = [0.12, 0.12, 0.1, 0.08, 0.07, 0.06, 0.055, 0.05, 0.045, 0.04];

class SinsOfTheMany extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    atonement: Atonement,
  };
  bonusDamage = 0;
  bonusHealing = 0;
  protected atonement!: Atonement;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.SINS_OF_THE_MANY_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onDamage);

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.onHeal);
  }

  get currentBonus() {
    const activeBuffs = this.atonement.numAtonementsActive;

    // Return an override, if necessary
    if (BONUS_DAMAGE_ARRAY[activeBuffs]) {
      return BONUS_DAMAGE_ARRAY[activeBuffs];
    }

    // Return the floor if we have more atonements than in the map
    return SINS_OF_THE_MANY_FLOOR_BONUS;
  }

  /**
   * Sins of the Many buffs all of your damage, there is no whitelist
   */
  onDamage(event: DamageEvent) {
    this.bonusDamage += calculateEffectiveDamage(event, this.currentBonus);
  }

  /**
   * This is whitelisted by virtue of Atonement naturally not occuring
   * from abilities not in the whitelist.
   */
  onHeal(event: AtonementAnalyzerEvent) {
    const { healEvent } = event;
    this.bonusHealing += calculateEffectiveHealing(healEvent, this.currentBonus);
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            The effective healing contributed by Sins of the Many was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.bonusHealing))}% of
            total healing done.
            <br />
            The direct damage contributed by Sins of the Many was{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))}% of
            total damage done.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_PRIEST.SINS_OF_THE_MANY_TALENT.id}>
          <ItemHealingDone amount={this.bonusHealing} /> <br />
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SinsOfTheMany;
