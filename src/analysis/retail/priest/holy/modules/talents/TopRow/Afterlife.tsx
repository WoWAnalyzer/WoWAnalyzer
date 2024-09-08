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

// Example Log: /report/zCMpvAPYW16k3bQr/33-Normal+G'huun+-+Wipe+12+(8:24)/60-Кеонна
class Afterlife extends Analyzer {
  spiritOfRedemptionCount = 0;
  spiritOfRedemptionTotalTime = 0;
  spiritOfRedemptionBonusTime = 0;
  spiritOfRedemptionStartTime = 0;
  timeInSoR = 0;
  sorCount = 0;
  inSpiritOfRedemption = false;

  healingInAfterlife = 0;

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

  get extraTimeInSoR() {
    return this.timeInSoR - SPIRIT_OF_REDEMPTION_DURATION * this.sorCount;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.inSpiritOfRedemption = true;
    this.spiritOfRedemptionStartTime = event.timestamp;
    this.sorCount += 1;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.inSpiritOfRedemption = false;
    const timeInSpiritOfRedemption = event.timestamp - this.spiritOfRedemptionStartTime;
    this.spiritOfRedemptionTotalTime += timeInSpiritOfRedemption;
    const spiritOfRedemptionBonusTime = timeInSpiritOfRedemption - SPIRIT_OF_REDEMPTION_DURATION;
    if (spiritOfRedemptionBonusTime > 0) {
      this.spiritOfRedemptionBonusTime += spiritOfRedemptionBonusTime;
    }
  }

  onHeal(event: HealEvent) {
    if (
      this.inSpiritOfRedemption &&
      event.timestamp - this.spiritOfRedemptionStartTime > SPIRIT_OF_REDEMPTION_DURATION
    ) {
      this.healingInAfterlife += event.amount || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        tooltip={`Extra Spirit of Redemption time: ${Math.floor(
          this.spiritOfRedemptionBonusTime / 1000,
        )}s`}
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
