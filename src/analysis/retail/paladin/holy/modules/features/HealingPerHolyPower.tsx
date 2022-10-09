import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class HealingPerHolyPower extends Analyzer {
  totalEffectiveHealing = 0;
  totalSpenders = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.WORD_OF_GLORY, TALENTS.LIGHT_OF_DAWN_TALENT]),
      this.castSpender,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.WORD_OF_GLORY, SPELLS.LIGHT_OF_DAWN_HEAL]),
      this.healEvent,
    );
  }

  castSpender(event: CastEvent) {
    this.totalSpenders += 1;
  }

  healEvent(event: HealEvent) {
    this.totalEffectiveHealing += event.amount + (event.absorbed || 0); // effective healing by default does not include healing done to healing absorbs, even though that is effective healing
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            Total healing by spenders, divided by total number of holy power spent on those spenders{' '}
            <br></br>
            Total healing from spenders: {this.totalEffectiveHealing} <br></br>
            Total spenders: {this.totalSpenders}
          </>
        }
      >
        <BoringValueText label={<>Average Healing per Holy Power</>}>
          <>{formatNumber(this.totalEffectiveHealing / this.totalSpenders / 3)}</>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default HealingPerHolyPower;
