import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink'; 
import Wrapper from 'common/Wrapper';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import DarkShadow from './DarkShadow';

class DarkShadowSpecterOfBetrayal extends DarkShadow {
  
  suggestions(when) {
    const totalSpecterCastsInShadowDance  = this.danceDamageTracker.getAbility(SPELLS.SUMMON_DREAD_REFLECTION.id).casts;
    const totalSpecterCast  = this.damageTracker.getAbility(SPELLS.SUMMON_DREAD_REFLECTION.id).casts;
    const castsInDanceShare = totalSpecterCastsInShadowDance / totalSpecterCast;
    when(castsInDanceShare).isLessThan(0.90)
    .addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Use <ItemLink id={ITEMS.SPECTER_OF_BETRAYAL.id} /> during <SpellLink id={SPELLS.SHADOW_DANCE.id} /> when you are using <SpellLink id={SPELLS.DARK_SHADOW_TALENT.id} />. </Wrapper>)
        .icon(ITEMS.SPECTER_OF_BETRAYAL.icon)
        .actual(`You used Specter of Betrayal in Shadow Dance ${formatPercentage(actual)}% of the time`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`)
        .regular(0.80);
        //Its around 1% dps loss when pressing it on cooldown, so never Major.
    });
  }

}

export default DarkShadowSpecterOfBetrayal;
