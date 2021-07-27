import { Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { SuggestionImportance } from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import castCount from 'parser/shared/metrics/castCount';
import React from 'react';

export interface LowRankSpells {
  [primarySpellId: number]: number[];
}

const lowRankSpells = (spells: LowRankSpells) => (
  events: AnyEvent[],
  { playerId }: Pick<Info, 'playerId'>,
) => {
  const casts = castCount(events, playerId);

  return Object.entries<number[]>(spells as { [key: string]: number[] }).flatMap(
    ([primarySpellId, lowRankSpellIds]) =>
      lowRankSpellIds
        .filter((spellId) => casts[spellId] > 0)
        .map((spellId) => ({
          text: (
            <Trans id="tbc.suggestions.lowRankSpells">
              You cast the lower rank <SpellLink id={spellId} />. You should use the max rank{' '}
              <SpellLink id={Number(primarySpellId)} /> instead.
            </Trans>
          ),
          importance: SuggestionImportance.Major,
          icon: (SPELLS[primarySpellId] || SPELLS[spellId])?.icon,
        })),
  );
};

export default lowRankSpells;
