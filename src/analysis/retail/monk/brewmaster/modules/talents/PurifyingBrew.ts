import { Options } from 'parser/core/Analyzer';
import StaggerStatistic from '../tools/StaggerAnalyzer';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import talents from 'common/TALENTS/monk';
import Events, { CastEvent } from 'parser/core/Events';
import { purifyingBrewClear } from '../../normalizers/StaggerClearSourceLinkNormalizer';
import { BadColor } from 'interface/guide';

export default class PurifyingBrew extends StaggerStatistic {
  constructor(options: Options) {
    super(talents.PURIFYING_BREW_TALENT, options);

    this.active = this.selectedCombatant.hasTalent(talents.PURIFYING_BREW_TALENT);

    this.addEventListener(Events.cast.spell(SPELLS.PURIFYING_BREW_TALENT), this.onCast);
  }

  public readonly purifies: { amount: number; oldPooledAmount: number; timestamp: number }[] = [];

  private onCast(event: CastEvent): void {
    const clear = purifyingBrewClear.first(event);
    if (!clear) {
      this.addDebugAnnotation(event, {
        summary: 'Purifying Brew without clear event',
        color: BadColor,
      });
      return;
    }

    const point = this.deps.stagger.getPoolAtTime(event.timestamp);
    const amount = clear.amount * point.remainingTicks;
    this.purifies.push({
      timestamp: event.timestamp,
      amount,
      oldPooledAmount: point.total,
    });
    // PB logs the per-tick amount
    this.removeStagger(event, amount);
  }
}
