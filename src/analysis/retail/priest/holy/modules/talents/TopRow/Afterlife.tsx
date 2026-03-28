import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPIRIT_OF_REDEMPTION_DURATION } from '../../../constants';

/**
 * Afterlife
 * Increases the duration of Spirit of Redemption by 50% and the range of its spells by 50%.
 * This module tracks the healing done during the extra 50% duration.
 */

class Afterlife extends Analyzer {
  private spiritOfRedemptionStartTime = 0;
  private inSpiritOfRedemption = false;
  private healingInAfterlife = 0;
  private bonusTime = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AFTERLIFE_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_OF_REDEMPTION_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SPIRIT_OF_REDEMPTION_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.inSpiritOfRedemption = true;
    this.spiritOfRedemptionStartTime = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.inSpiritOfRedemption = false;
    const actualDuration = event.timestamp - this.spiritOfRedemptionStartTime;
    const extra = actualDuration - SPIRIT_OF_REDEMPTION_DURATION;
    if (extra > 0) {
      this.bonusTime += extra;
    }
  }

  onHeal(event: HealEvent) {
    // Only count healing that occurs after the normal duration (i.e., during the bonus time)
    if (
      this.inSpiritOfRedemption &&
      event.timestamp - this.spiritOfRedemptionStartTime > SPIRIT_OF_REDEMPTION_DURATION
    ) {
      this.healingInAfterlife += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            Extra Spirit of Redemption time: {Math.floor(this.bonusTime / 1000)}s
            {/* oxlint-disable-next-line @wowanalyzer/no-br */}
            <br />
            Healing contributed during the extra 50% duration.
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(3)}
      >
        <BoringSpellValueText spell={TALENTS.AFTERLIFE_TALENT}>
          <ItemHealingDone amount={this.healingInAfterlife} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Afterlife;
