import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';

function suggest(when, suggestion) {
  when(suggestion).addSuggestion((suggest, actual, recommended) =>
    suggest(
      <>
        You refreshed <SpellLink spell={suggestion.spell.id} /> early {suggestion.count} times when
        you had better spells to cast. See the highlighted casts on the timeline for more
        information.
      </>,
    )
      .icon(suggestion.spell.icon)
      .actual(`${formatPercentage(actual)}% bad dot refreshes`)
      .recommended(`<${formatPercentage(recommended)}% is recommended`),
  );
}

export default suggest;
