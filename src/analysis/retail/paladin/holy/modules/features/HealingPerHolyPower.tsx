import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';

class HealingPerHolyPower extends Analyzer {
  totalEffectiveHealing = 0;
  totalGlimmerHealing = 0; // Glistening Radiance talent
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
    // TODO: get glistening radiance procs healing
    // need to add a cast link normalizer for glistening radiance
  }

  healEvent(event: HealEvent) {
    this.totalEffectiveHealing += event.amount + (event.absorbed || 0); // effective healing by default does not include healing done to healing absorbs, even though that is effective healing
  }

  glimmerStat() {
    if (this.selectedCombatant.hasTalent(TALENTS.GLISTENING_RADIANCE_TALENT)) {
      return (
        <>
          Total healing from <SpellLink spell={TALENTS.GLISTENING_RADIANCE_TALENT} /> procs:{' '}
          {formatNumber(this.totalGlimmerHealing)}
          <br />
        </>
      );
    }
    return null;
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
            <br />
            Total healing from spenders: {formatNumber(this.totalEffectiveHealing)} <br />
            {this.glimmerStat()}
            Total spenders: {formatNumber(this.totalSpenders)}
          </>
        }
      >
        <BoringValueText label={<>Average Healing per Holy Power</>}>
          <>
            {formatNumber(
              (this.totalEffectiveHealing + this.totalGlimmerHealing) / this.totalSpenders / 3,
            )}
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default HealingPerHolyPower;
