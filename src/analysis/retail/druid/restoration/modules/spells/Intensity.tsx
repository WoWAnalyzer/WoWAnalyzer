import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatOverhealing } from 'analysis/retail/druid/restoration/format';

const INTENSITY_CRIT_HEAL_INCREASE = 2.6 / 2 - 1;

/**
 * **Intensity**
 * Spec Talent
 *
 * Regrowth critical heals are 260% effective instead of 200%.
 */
class Intensity extends Analyzer {
  totalEffectiveHealing = 0;
  totalOverhealing = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.INTENSITY_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.REGROWTH),
      this.onRegrowthHeal,
    );
  }

  onRegrowthHeal(event: HealEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    this.totalEffectiveHealing += calculateEffectiveHealing(event, INTENSITY_CRIT_HEAL_INCREASE);
    this.totalOverhealing += calculateOverhealing(event, INTENSITY_CRIT_HEAL_INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(8)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <strong>
            Overhealing: {formatOverhealing(this.totalOverhealing, this.totalEffectiveHealing)}
          </strong>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.INTENSITY_TALENT}>
          <ItemPercentHealingDone amount={this.totalEffectiveHealing} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Intensity;
