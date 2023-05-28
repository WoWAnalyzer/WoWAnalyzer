import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import StaggerFabricator from '../core/StaggerFabricator';

export default class StaggeringStrikes extends Analyzer {
  static dependencies = {
    staggerFab: StaggerFabricator,
  };

  protected staggerFab!: StaggerFabricator;

  protected rank: number;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.getTalentRank(talents.STAGGERING_STRIKES_TALENT);
    this.active = this.rank > 0;

    this.addEventListener(Events.cast.spell(SPELLS.BLACKOUT_KICK_BRM), this.onKick);
  }

  private onKick(event: CastEvent) {
    // not attempting to compensate for missing attack power, it is insanely
    // rare from what i've seen. we accept the loss to reduce complexity.

    const amount = ((event.attackPower ?? 0) * this.rank) / 2;

    this.staggerFab.removeStagger(event, amount);
  }
}
