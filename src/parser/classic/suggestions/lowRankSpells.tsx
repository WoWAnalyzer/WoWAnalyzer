import { Trans } from '@lingui/macro';
import { maybeGetSpell } from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { SuggestionImportance } from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import castCount from 'parser/shared/metrics/castCount';

export interface LowRankSpells {
  [primarySpellId: number]: number[];
}

const lowRankSpells = (spells: LowRankSpells, whitelist: LowRankSpells = []) =>
  suggestion((events: AnyEvent[], { playerId }: Pick<Info, 'playerId'>) => {
    const casts = castCount(events, playerId);

    return Object.entries<number[]>(spells as { [key: string]: number[] }).flatMap(
      ([primarySpellId, lowRankSpellIds]) =>
        lowRankSpellIds
          .filter(
            (spellId) =>
              casts[spellId] > 0 && !whitelist[Number(primarySpellId)]?.includes(spellId),
          )
          .map((spellId) => ({
            text: (
              <Trans id="tbc.suggestions.lowRankSpells">
                You cast a lower rank <SpellLink id={spellId} />. You should use the max rank{' '}
                <SpellLink id={Number(primarySpellId)} /> instead.
              </Trans>
            ),
            importance: SuggestionImportance.Regular,
            icon: (maybeGetSpell(primarySpellId) || maybeGetSpell(spellId))?.icon,
          })),
    );
  });

export default lowRankSpells;
