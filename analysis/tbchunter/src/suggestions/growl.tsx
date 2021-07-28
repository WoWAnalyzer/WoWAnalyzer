import { Trans } from '@lingui/macro';
import SPELL_INFO from 'common/SPELLS';
import SpellLink from 'interface/SpellLink';
import { SuggestionImportance } from 'parser/core/CombatLogParser';
import { AnyEvent } from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import React from 'react';

import growlCasts from '../metrics/growlCasts';
import * as SPELLS from '../SPELLS_PET';

const growl = () => (events: AnyEvent[], { pets }: Pick<Info, 'pets'>) => {
  const casts = growlCasts(events, pets);

  if (casts > 0) {
    return {
      text: (
        <Trans id="tbc.suggestions.hunter.growl">
          Your pet cast <SpellLink id={SPELLS.GROWL} />. You should not cast it when playing with a
          tank to avoid your pet from taking aggro. In addition, casting{' '}
          <SpellLink id={SPELLS.GROWL} /> costs energy, which may reduce your pet's DPS.
        </Trans>
      ),
      importance: SuggestionImportance.Regular,
      icon: SPELL_INFO[SPELLS.GROWL].icon,
    };
  }
};

export default growl;
