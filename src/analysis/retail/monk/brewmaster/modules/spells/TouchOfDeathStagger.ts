import { Options } from 'parser/core/Analyzer';
import StaggerStatistic from '../tools/StaggerAnalyzer';
import talents from 'common/TALENTS/monk';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import { touchOfDeathClear } from '../../normalizers/StaggerClearSourceLinkNormalizer';

export default class TouchOfDeathStagger extends StaggerStatistic {
  constructor(options: Options) {
    // bit of a lie since it isn't tied to imp tod
    super(SPELLS.TOUCH_OF_DEATH, options);

    this.addEventListener(Events.damage.spell(SPELLS.TOUCH_OF_DEATH), this.onDamage);
  }

  private onDamage(event: DamageEvent): void {
    const clear = touchOfDeathClear.first(event);
    if (!clear) {
      return; // not super important
    }

    // ToD logs total stagger cleared
    this.removeStagger(event, clear.amount);
  }
}
