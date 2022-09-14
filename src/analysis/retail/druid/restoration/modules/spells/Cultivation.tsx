import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import Mastery from 'analysis/retail/druid/restoration/modules/core/Mastery';
import { TALENTS_DRUID } from 'common/TALENTS';

/**
 * **Cultivation**
 * Spec Talent Tier 6
 *
 * When Rejuvenation heals a target below 60% health, it applies Cultivation to the target,
 * healing them for (X% of Spell power) over 6 sec.
 */
class Cultivation extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.CULTIVATION_RESTORATION_TALENT);
  }

  get directHealing() {
    return this.mastery.getDirectHealing(SPELLS.CULTIVATION.id);
  }

  get masteryHealing() {
    return this.mastery.getMasteryHealing(SPELLS.CULTIVATION.id);
  }

  get totalHealing() {
    return this.directHealing + this.masteryHealing;
  }

  get totalPercent() {
    return this.owner.getPercentageOfTotalHealingDone(this.totalHealing);
  }

  get suggestionThresholds() {
    return {
      actual: this.totalPercent,
      isLessThan: {
        minor: 0.06,
        average: 0.045,
        major: 0.03,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your healing from <SpellLink id={SPELLS.CULTIVATION.id} /> could be improved. You may have
          too many healers or doing easy content, thus having low cultivation proc rate. You may
          considering selecting another talent.
        </>,
      )
        .icon(SPELLS.CULTIVATION.icon)
        .actual(
          t({
            id: 'druid.restoration.suggestions.cultivation.notOptimal',
            message: `${formatPercentage(this.totalPercent)}% healing`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(40)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            This is the sum of the direct healing from Cultivation and the healing enabled by
            Cultivation's extra mastery stack.
            <ul>
              <li>
                Direct: <strong>{this.owner.formatItemHealingDone(this.directHealing)}</strong>
              </li>
              <li>
                Mastery: <strong>{this.owner.formatItemHealingDone(this.masteryHealing)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_DRUID.CULTIVATION_RESTORATION_TALENT.id}>
          <ItemPercentHealingDone amount={this.totalHealing} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Cultivation;
