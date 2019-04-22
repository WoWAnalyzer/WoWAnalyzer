import React from 'react';
import { formatPercentage, formatDuration } from 'common/format';
import SpellLink from 'common/SpellLink';

  function suggest(when, suggestion) {
    when(suggestion).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You refreshed <SpellLink id={suggestion.spell.id} /> early {suggestion.count} times when you had better spells to cast, resulting in {formatDuration(suggestion.wastedDuration)} seconds lost. See the highlighted casts on the timeline for more information.</>)
        .icon(suggestion.spell.icon)
        .actual(`${formatPercentage(actual)}% effective duration`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }

  export default suggest;
