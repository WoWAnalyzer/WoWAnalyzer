import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import StaggerStatistic from '../tools/StaggerAnalyzer';

export default class StaggeringStrikes extends StaggerStatistic {
  protected rank: number;

  constructor(options: Options) {
    super(talents.STAGGERING_STRIKES_TALENT, options);

    this.rank = this.selectedCombatant.getTalentRank(talents.STAGGERING_STRIKES_TALENT);
    this.active = this.rank > 0;

    this.addEventListener(Events.cast.spell(SPELLS.BLACKOUT_KICK_BRM), this.onKick);
  }

  private onKick(event: CastEvent) {
    // not attempting to compensate for missing attack power, it is insanely
    // rare from what i've seen. we accept the loss to reduce complexity.

    const amount = ((event.attackPower ?? 0) * this.rank) / 2;

    this.removeStagger(event, amount);
  }
}
