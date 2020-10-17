import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import EarlyDotRefreshesCore from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';
import suggest from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshesSuggestion';
import Events from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';


const MINOR_THRESHOLD = 0.975;
const AVERAGE_THRESHOLD = 0.95;
const MAJOR_THRESHOLD = 0.9;

class EarlyDotRefresh extends EarlyDotRefreshesCore {
  static dots = [
    {
      name: 'Rupture',
      debuffId: SPELLS.RUPTURE.id,
      castId: SPELLS.RUPTURE.id,
      duration: 20000,
    },
    {
      name: 'Garrote',
      debuffId: SPELLS.GARROTE.id,
      castId: SPELLS.GARROTE.id,
      duration: 18000,
    },
  ];

  constructor(options){
    super(options);
    this.addEventListener(Events.SpendResource.by(SELECTED_PLAYER), this.onSpendResource);
  }

  onSpendResource(event) {
    const comboPointsSpent = event.resourceChange;
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) {
      return;
    }

    //Update duration.
    this.getDot(SPELLS.RUPTURE.id).duration = (comboPointsSpent * 4 + 4) * 1000;
  }
  
  // Checks the status of the last cast and marks it accordingly.
  getLastBadCastText(event, dot) {    
    if (dot.castId === SPELLS.RUPTURE.id) {
      return super.getLastBadCastText(event,dot) + " *Based on the amount of CPs spent.";
    }
    return super.getLastBadCastText(event,dot);
  }

  get suggestionThresholdsRuptureEfficiency() {
    return this.makeSuggestionThresholds(SPELLS.RUPTURE,MINOR_THRESHOLD,AVERAGE_THRESHOLD,MAJOR_THRESHOLD);
  }
  get suggestionThresholdsGarroteEfficiency() {
    return this.makeSuggestionThresholds(SPELLS.GARROTE,MINOR_THRESHOLD,AVERAGE_THRESHOLD,MAJOR_THRESHOLD);
  }

  suggestions(when) {
    suggest(when, this.suggestionThresholdsRuptureEfficiency);
    suggest(when, this.suggestionThresholdsGarroteEfficiency);
  }
}

export default EarlyDotRefresh;
