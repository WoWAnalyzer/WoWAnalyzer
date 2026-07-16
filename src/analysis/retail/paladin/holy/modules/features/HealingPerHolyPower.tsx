import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { getWordofGlorySpell } from 'analysis/retail/paladin/shared/constants';

// TODO: Glistening Radiance proc healing is not attributed and so is not counted
// here. It needs a cast link normalizer before it can be included.
class HealingPerHolyPower extends Analyzer {
  totalEffectiveHealing = 0;
  totalSpenders = 0;

  constructor(options: Options) {
    super(options);

    const wordOfGlorySpell = getWordofGlorySpell(this.selectedCombatant);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([wordOfGlorySpell, TALENTS.LIGHT_OF_DAWN_TALENT]),
      this.castSpender,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([wordOfGlorySpell, SPELLS.LIGHT_OF_DAWN_HEAL]),
      this.healEvent,
    );
  }

  castSpender() {
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
            <div>
              Total healing by spenders, divided by total number of holy power spent on those
              spenders{' '}
            </div>
            <div>Total healing from spenders: {formatNumber(this.totalEffectiveHealing)}</div>
            <div>Total spenders: {formatNumber(this.totalSpenders)}</div>
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
