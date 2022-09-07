import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const RISING_SUN_REDUCTION = 1000;

/**
 * Every time you cast rising sun kick it reduces revival's cooldown by 1 second and whenever you cast revival x% of that healing is done again as a hot over 10 seconds
 */
class RisingSunRevival extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    healingDone: HealingDone,
  };
  cooldownReductionUsed: number = 0;
  cooldownReductionWasted: number = 0;
  protected spellUsable!: SpellUsable;
  protected healingDone!: HealingDone;

  constructor(options: Options) {
    super(options);
    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.RISING_SUN_REVIVAL.id);

    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RISING_SUN_KICK),
      this.rskCast,
    );
  }

  rskCast(event: CastEvent) {
    // Cooldown Reduction on Revival
    if (this.spellUsable.isOnCooldown(SPELLS.REVIVAL.id)) {
      this.cooldownReductionUsed += this.spellUsable.reduceCooldown(
        SPELLS.REVIVAL.id,
        RISING_SUN_REDUCTION,
      );
    } else {
      this.cooldownReductionWasted += RISING_SUN_REDUCTION;
    }
  }

  get rsrHealing() {
    return this.healingDone.byAbility(SPELLS.RISING_SUN_REVIVAL_HEAL.id).effective;
  }

  get rsrOverHealing() {
    return this.healingDone.byAbility(SPELLS.RISING_SUN_REVIVAL_HEAL.id).overheal;
  }

  statistic() {
    const healing = this.rsrHealing;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            Effective Cooldown Reduction: {formatNumber(this.cooldownReductionUsed / 1000)} Seconds
            <br />
            Wasted Cooldown Reduction: {formatNumber(this.cooldownReductionWasted / 1000)} Seconds
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.RISING_SUN_REVIVAL.id}>
          <ItemHealingDone amount={healing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RisingSunRevival;
