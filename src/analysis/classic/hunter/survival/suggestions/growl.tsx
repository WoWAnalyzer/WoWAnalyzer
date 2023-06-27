
import SpellLink from 'interface/SpellLink';
import { SuggestionImportance } from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';

import growlCasts from '../metrics/growlCasts';
import * as SPELLS from '../../shared/SPELLS_PET';

const growl =
  () =>
  (events: AnyEvent[], { pets }: Pick<Info, 'pets'>) => {
    const casts = growlCasts(events, pets);

    if (casts > 0) {
      return {
        text: (
          <>
            Your pet cast <SpellLink id={SPELLS.GROWL} />. You should not cast it when playing with
            a tank to avoid your pet from taking aggro. In addition, casting{' '}
            <SpellLink id={SPELLS.GROWL} /> costs energy, which may reduce your pet's DPS.
          </>
        ),
        importance: SuggestionImportance.Regular,
        spell: SPELLS.GROWL,
      };
    }
  };

export default growl;
