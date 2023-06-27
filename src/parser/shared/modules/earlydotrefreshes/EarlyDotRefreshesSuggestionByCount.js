import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';

function suggest(when, suggestion) {
  when(suggestion).addSuggestion((suggest, actual, recommended) =>
    suggest(
      <>
        You refreshed <SpellLink spell={suggestion.spell.id} /> early {suggestion.count} times. The
        individual casts are highlighted on the timeline.
      </>,
    )
      .icon(suggestion.spell.icon)
      .actual(`${formatPercentage(actual)}% effective duration`)
      .recommended(`<${formatPercentage(recommended)}% is recommended`),
  );
}

export default suggest;
