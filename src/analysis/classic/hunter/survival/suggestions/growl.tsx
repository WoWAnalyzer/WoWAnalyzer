import { Trans } from '@lingui/macro';
import SpellLink from 'interface/SpellLink';
import { SuggestionImportance } from 'parser/core/CombatLogParser';
import { MappedEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';

import growlCasts from '../metrics/growlCasts';
import * as SPELLS from '../../shared/SPELLS_PET';

const growl =
  () =>
  (events: MappedEvent[], { pets }: Pick<Info, 'pets'>) => {
    const casts = growlCasts(events, pets);

    if (casts > 0) {
      return {
        text: (
          <Trans id="tbc.suggestions.hunter.growl">
            Your pet cast <SpellLink spell={SPELLS.GROWL} />. You should not cast it when playing
            with a tank to avoid your pet from taking aggro. In addition, casting{' '}
            <SpellLink spell={SPELLS.GROWL} /> costs energy, which may reduce your pet's DPS.
          </Trans>
        ),
        importance: SuggestionImportance.Regular,
        spell: SPELLS.GROWL,
      };
    }
  };

export default growl;
