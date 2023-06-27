
import SPELLS from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { suggestion } from 'parser/core/Analyzer';
import { SuggestionImportance } from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import castCount from 'parser/shared/metrics/castCount';

export interface LowRankSpells {
  [primarySpellId: number]: number[];
}

const lowRankSpellsPet = (spells: LowRankSpells) =>
  suggestion((events: AnyEvent[], { pets }: Pick<Info, 'pets'>) =>
    pets.flatMap((pet) => {
      const casts = castCount(events, pet.id);

      return Object.entries<number[]>(spells as { [key: string]: number[] }).flatMap(
        ([primarySpellId, lowRankSpellIds]) =>
          lowRankSpellIds
            .filter((spellId) => casts[spellId] > 0)
            .map((spellId) => ({
              text: (
                <>
                  Your pet cast a lower rank <SpellLink id={spellId} />. You should teach your pet
                  the max rank <SpellLink id={Number(primarySpellId)} />. See{' '}
                  <a
                    href="https://www.wow-petopia.com/classic_bc/abilities.php"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Petopia
                  </a>{' '}
                  for info on where to learn the max rank pet abilities.
                </>
              ),
              importance: SuggestionImportance.Regular,
              icon: (SPELLS[Number(primarySpellId)] || SPELLS[spellId])?.icon,
            })),
      );
    }),
  );

export default lowRankSpellsPet;
