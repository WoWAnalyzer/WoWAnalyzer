import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import { TALENTS_EVOKER } from 'common/TALENTS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';

const LEECH_PERCENT = 0.03;

class RegenerativeMagic extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  totalHealing: number = 0;
  protected statTracker!: StatTracker;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LEECH), this.onHeal);
  }

  onHeal(event: HealEvent) {
    const increase =
      1 -
      this.statTracker.currentLeechPercentage /
        (this.statTracker.currentLeechPercentage - LEECH_PERCENT);
    this.totalHealing += calculateEffectiveHealing(event, increase);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.REGENERATIVE_MAGIC_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RegenerativeMagic;
