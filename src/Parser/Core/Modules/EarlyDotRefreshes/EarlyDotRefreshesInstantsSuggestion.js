import React from 'react';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

  function suggest(when, suggestion) {
    when(suggestion).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>You refreshed <SpellLink id={suggestion.spell.id} /> early {suggestion.count} times when you had better spells to cast. See the highlighted casts on the timeline for more information.</React.Fragment>)
        .icon(suggestion.spell.icon)
        .actual(`${formatPercentage(actual)}% bad Dot refreshes`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }

  export default suggest;
