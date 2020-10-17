import React from 'react';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

  function suggest(when, suggestion) {
    when(suggestion).addSuggestion((suggest, actual, recommended) => suggest(<>You refreshed <SpellLink id={suggestion.spell.id} /> early {suggestion.count} times when you had better spells to cast. See the highlighted casts on the timeline for more information.</>)
        .icon(suggestion.spell.icon)
        .actual(i18n._(t('shared.suggestions.dots.badRefreshes')`${formatPercentage(actual)}% bad dot refreshes`))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  export default suggest;
