import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

import DarkShadow from './DarkShadow';

class DarkShadowEvis extends DarkShadow {

  
  suggestions(when) {
    const totalEviscerateHitsInShadowDance  = this.danceDamageTracker.getAbility(SPELLS.EVISCERATE.id).damageHits;
    const danceEvis = totalEviscerateHitsInShadowDance / this.totalShadowDanceCast;
    when(danceEvis).isLessThan(1.75)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Try to cast more <SpellLink id={SPELLS.EVISCERATE.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} /> when you are using <SpellLink id={SPELLS.DARK_SHADOW_TALENT.id} />. </React.Fragment>)
        .icon(SPELLS.EVISCERATE.icon)
        .actual(`You cast an average of ${actual.toFixed(2)} Eviscerates during Shadow Dance. This number includes Eviscerates cast from Death from Above.`)
        .recommended(`>${recommended} is recommended`)
        .regular(1.5)
        .major(1.25);
    });
  }

  statistic() {    
  const totalEviscerateHitsInShadowDance  = this.danceDamageTracker.getAbility(SPELLS.EVISCERATE.id).damageHits;
  const danceEvis = totalEviscerateHitsInShadowDance / this.totalShadowDanceCast;
  return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EVISCERATE.id} />}
        value={`${danceEvis.toFixed(2)}`}
        label="Average Eviscerates in Shadow Dance"
        tooltip={`Your average Eviscerate casts per Shadow Dance. You cast ${totalEviscerateHitsInShadowDance} Eviscerates in ${this.totalShadowDanceCast} Shadow Dances. This number includes Eviscerates cast from Death from Above.`}
        />
  );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default DarkShadowEvis;
