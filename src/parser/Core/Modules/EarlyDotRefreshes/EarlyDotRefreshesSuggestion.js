import React from 'react';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

  function suggest(when, suggestion) {
    when(suggestion).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You refreshed <SpellLink id={suggestion.spell.id} /> early {suggestion.count} times. The individual casts are highlighted on the timeline.</React.Fragment>)
        .icon(suggestion.spell.icon)
        .actual(`${formatPercentage(actual)}% early refreshes`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }

  export default suggest;
