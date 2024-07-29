import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { CastEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { FB_SPELLS, getFerociousBiteMaxDrain } from 'analysis/retail/druid/feral/constants';
import { getDamageHits } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import { getAdditionalEnergyUsed } from 'analysis/retail/druid/feral/normalizers/FerociousBiteDrainLinkNormalizer';
import TalentSpellText from 'parser/ui/TalentSpellText';

const FEROCIOUS_BITE_BONUS_BOOST_PER_POINT = 0.4;

/**
 * **Saber Jaws**
 * Spec Talent
 *
 * When you spend extra Energy on Ferocious Bite, the extra damage is increased by (40/80)%.
 */
export default class SaberJaws extends Analyzer {
  /** Number of points in Carnivorous Instinct */
  rank;
  /** The amount Saber Jaws multiplies the bonus damage */
  bonusMultiplier;
  /** Total damage added by Saber Jaws */
  totalDamage: number = 0;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.getTalentRank(TALENTS_DRUID.SABER_JAWS_TALENT);
    this.active = this.rank > 0;

    this.bonusMultiplier = 1 + FEROCIOUS_BITE_BONUS_BOOST_PER_POINT * this.rank;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FB_SPELLS), this.onFbCast);
  }

  // Convoke'd bites don't proc Saber Jaws, so it's fine we're missing them here
  onFbCast(event: CastEvent) {
    const fbDrain = getAdditionalEnergyUsed(event);
    if (!fbDrain) {
      // either apex proc or minimum energy bite, neither of which are boosted by Saber Jaws
      return;
    }

    const maxDrain = getFerociousBiteMaxDrain(this.selectedCombatant);
    const percentDrain = fbDrain / maxDrain;
    /*
     * Saber Jaws boosts FB's BONUS damage, not the total.
     *
     * For example, imagine a player with rank 2 SJ (+80% bonus):
     *
     * On a full drain bite, we do 180% bonus damage (280% total) vs the 100% bonus damage (200% total)
     * that we would have had without Saber Jaws. This is a total boost of 280/200 = 1.4.
     *
     * On a half drain bite, we do 90% bonus damage (50*1.8, 190% total) vs the 50% bonus damage (150% total)
     * that we would have had without Saber Jaws. This is a total boost of 190/150 = 1.266...
     */
    const effectiveBoostVsNormalDrain =
      (1 + percentDrain * this.bonusMultiplier) / (1 + percentDrain) - 1;

    getDamageHits(event).forEach((hit) => {
      this.totalDamage += calculateEffectiveDamage(hit, effectiveBoostVsNormalDrain);
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(8)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_DRUID.SABER_JAWS_TALENT}>
          <ItemPercentDamageDone amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
