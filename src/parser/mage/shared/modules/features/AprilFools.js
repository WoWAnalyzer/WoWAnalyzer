import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

class AprilFools extends Analyzer {
  
  cast = 2;
  
  get suggestionThresholds() {
    return {
      actual: this.cast,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

	suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(`You dropped a table or placed a portal to current content. Make those lazy healers buy their own food and do your part to make the world bigger by sending them to the far edges of the world instead of the main cities. I hear the swamps in Stonard are beautiful this time of year anyway.`)
					.icon(SPELLS.CONJURE_REFRESHMENT.icon);
			});
	}
}

export default AprilFools;
