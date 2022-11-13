import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import Mastery from 'analysis/retail/druid/restoration/modules/core/Mastery';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/druid/restoration/Guide';
import CastEfficiencyPanel from 'interface/guide/components/CastEfficiencyPanel';

/**
 * **Cenarion Ward**
 * Spec Talent Tier 4
 *
 * Protects a friendly target for 30 sec.
 * Any damage taken will consume the ward and heal the target for (X% of Spell power) over 8 sec.
 */
class CenarionWard extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARION_WARD_TALENT);
  }

  get guideSubsection() {
    const explanation = (
      <p>
        <b>
          <SpellLink id={TALENTS_DRUID.CENARION_WARD_TALENT.id} />
        </b>{' '}
        is a talented HoT on a short cooldown. It is extremely powerful and efficient and should be
        cast virtually on cooldown. A tank is usually the best target.
      </p>
    );

    const data = <CastEfficiencyPanel spell={TALENTS_DRUID.CENARION_WARD_TALENT} useThresholds />;

    return explanationAndDataSubsection(explanation, data, GUIDE_CORE_EXPLANATION_PERCENT);
  }

  statistic() {
    const directHealing = this.mastery.getDirectHealing(SPELLS.CENARION_WARD_HEAL.id);
    const masteryHealing = this.mastery.getMasteryHealing(SPELLS.CENARION_WARD_HEAL.id);
    const totalHealing = directHealing + masteryHealing;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This is the sum of the direct healing from Cenarion Ward and the healing enabled by
            Cenarion Ward's extra mastery stack.
            <ul>
              <li>
                Direct: <strong>{this.owner.formatItemHealingDone(directHealing)}</strong>
              </li>
              <li>
                Mastery: <strong>{this.owner.formatItemHealingDone(masteryHealing)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DRUID.CENARION_WARD_TALENT.id}>
          <ItemPercentHealingDone amount={totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CenarionWard;
