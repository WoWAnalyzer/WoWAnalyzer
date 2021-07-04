import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { SuggestionImportance, WIPSuggestionFactory } from 'parser/core/CombatLogParser';
import castCount from 'parser/shared/metrics/castCount';
import React from 'react';

const lowRankSpells = (): WIPSuggestionFactory => (events, info) => {
  const { abilities } = info;
  const casts = castCount(events, info);

  return abilities
    .filter((ability) => ability.lowerRanks)
    .flatMap((ability) =>
      ability
        .lowerRanks!.filter((spellId) => casts[spellId] > 0)
        .map((spellId) => ({
          text: (
            <Trans>
              You cast the lower rank <SpellLink id={spellId} />. You should use the max rank{' '}
              <SpellLink id={ability.primarySpell} /> instead.
            </Trans>
          ),
          importance: SuggestionImportance.Major,
          icon: (SPELLS[ability.primarySpell] || SPELLS[spellId])?.icon,
        })),
    );
};

export default lowRankSpells;
