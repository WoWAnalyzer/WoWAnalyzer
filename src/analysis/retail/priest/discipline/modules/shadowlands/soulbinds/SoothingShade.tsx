import AtonementAnalyzer, {
  AtonementAnalyzerEvent,
} from 'analysis/retail/priest-discipline/modules/core/AtonementAnalyzer';
import SPELLS from 'common/SPELLS';
import SOULBINDS from 'game/shadowlands/SOULBINDS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const SOOTHING_SHADE_MASTERY = 550;
const SOOTHING_SHADE_MASTERY_PERCENT_INCREASE = SOOTHING_SHADE_MASTERY / 25.93;

class SoothingShade extends Analyzer {
  healing = 0;
  protected statTracker!: StatTracker;

  static dependencies = {
    statTracker: StatTracker,
  };

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasSoulbind(SOULBINDS.THEOTAR_THE_MAD_DUKE.id);
    if (!this.active) {
      return;
    }
    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
  }

  handleAtone(event: AtonementAnalyzerEvent) {
    if (
      !('absorb' in event.healEvent) ||
      !this.selectedCombatant.hasBuff(SPELLS.SOOTHING_SHADE.id)
    ) {
      // ignoring spirit shell
      return;
    }
    const masteryPercentage = this.statTracker.currentMasteryPercentage;
    const percentageIncrease =
      (masteryPercentage + 1) /
        (masteryPercentage + 1 - SOOTHING_SHADE_MASTERY_PERCENT_INCREASE / 100) -
      1;
    const effectiveHealing = calculateEffectiveHealing(event.healEvent, percentageIncrease);
    this.healing += effectiveHealing;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <>
          <BoringSpellValueText spellId={SPELLS.SOOTHING_SHADE.id}>
            <ItemHealingDone amount={this.healing} /> <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default SoothingShade;
