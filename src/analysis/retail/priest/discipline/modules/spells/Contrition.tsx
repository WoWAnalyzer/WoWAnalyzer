import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import StatTracker from 'parser/shared/modules/StatTracker';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { calculateOverhealing, OffensivePenanceBoltEstimation } from '../../SpellCalculations';
import Penance from './Penance';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class Contrition extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    penance: Penance, // we need this to add `penanceBoltNumber` to the damage and heal events
  };
  healing = 0;
  damagePenalty = 0;
  penanceBoltEstimation: any;
  protected statTracker!: StatTracker;
  protected penance!: Penance;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CONTRITION_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.CONTRITION_HEAL, SPELLS.PENANCE_HEAL]),
      this.onHeal,
    );
  }

  /**
   * Theory behind this is as follows
   * By casting a contrition penance, you lose an offensive penance worth of healing
   * To hone in on the true value of contrition, we estimate the healing of an offensive
   * penance hit, and subtract that from the contrition amount.
   *
   * We keep the penance heal as that is a true gain from choosing a contrition
   * penance over a regular offensive one.
   */
  onHeal(event: HealEvent) {
    // Add the healing to our count
    if (!this.penanceBoltEstimation) {
      this.penanceBoltEstimation = OffensivePenanceBoltEstimation(this.statTracker);
    }

    this.healing += event.amount;

    // Get an estimated amount of damage and healing for a bolt
    const { boltDamage, boltHealing } = this.penanceBoltEstimation();

    // Calculate the difference between contrition and an offensive penance
    if (event.ability.guid === SPELLS.CONTRITION_HEAL.id) {
      const estimatedBoltHealing = boltHealing * event.hitType;
      const estimatedOverhealing = calculateOverhealing(
        estimatedBoltHealing,
        event.amount,
        event.overheal,
      );

      this.healing -= estimatedBoltHealing - estimatedOverhealing;
    }

    // Calculate (if applicable), the damage penalty per bolt of friendly penance
    if (event.ability.guid === SPELLS.PENANCE_HEAL.id) {
      this.damagePenalty += boltDamage;
    }
  }

  statistic() {
    const healing = this.healing || 0;

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.CORE(8)}
        tooltip={`The effective healing contributed by Contrition (${formatPercentage(
          this.owner.getPercentageOfTotalHealingDone(healing),
        )}% of total healing done).
              You lost roughly ${formatNumber(
                (this.damagePenalty / this.owner.fightDuration) * 1000,
              )} DPS, or ${formatPercentage(
          this.owner.getPercentageOfTotalDamageDone(this.damagePenalty),
        )}% more damage.`}
      >
        <BoringSpellValueText spellId={TALENTS_PRIEST.CONTRITION_TALENT.id}>
          <ItemHealingDone amount={healing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Contrition;
