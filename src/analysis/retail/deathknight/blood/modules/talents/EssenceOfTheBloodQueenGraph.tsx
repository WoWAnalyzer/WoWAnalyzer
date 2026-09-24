import talents from 'common/TALENTS/deathknight';
import { Options } from 'parser/core/Analyzer';
import BuffStackGraph from 'parser/shared/modules/BuffStackGraph';
import EssenceOfTheBloodQueenStackTracker from './EssenceOfTheBloodQueenStackTracker';

class EssenceOfTheBloodQueenGraph extends BuffStackGraph {
  static dependencies = {
    ...BuffStackGraph.dependencies,
    essenceOfTheBloodQueenStackTracker: EssenceOfTheBloodQueenStackTracker,
  };

  protected essenceOfTheBloodQueenStackTracker!: EssenceOfTheBloodQueenStackTracker;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.VAMPIRIC_STRIKE_TALENT);
  }

  tracker() {
    return this.essenceOfTheBloodQueenStackTracker;
  }

  // plot included in Guide
}

export default EssenceOfTheBloodQueenGraph;
