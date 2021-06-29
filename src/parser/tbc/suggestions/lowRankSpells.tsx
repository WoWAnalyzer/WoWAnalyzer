import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import CombatLogParser, {
  SuggestionImportance,
  WIPSuggestionFactory,
} from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import castCount from 'parser/shared/stats/castCount';
import React from 'react';

const lowRankSpells = (): WIPSuggestionFactory => (events: AnyEvent[], parser: CombatLogParser) => {
  const { abilities } = parser.getModule(Abilities);
  const casts = castCount(events);

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
