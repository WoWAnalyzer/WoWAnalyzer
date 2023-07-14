import { MappedEvent } from 'parser/core/Events';
import metric from 'parser/core/metric';
import castCount from 'parser/shared/metrics/castCount';

import lowRankSpellsPet from '../../shared/lowRankSpellsPet';
import * as SPELLS from '../../shared/SPELLS_PET';

/**
 * Returns the max amount of Kill Command casts considering the buff uptime.
 * Does not account for fluctuating cooldowns.
 */
const growlCasts = (events: MappedEvent[], pets: Array<{ id: number }>) =>
  pets.reduce((sum, pet) => {
    const casts = castCount(events, pet.id);

    return (
      sum +
      (casts[SPELLS.GROWL] || 0) +
      lowRankSpellsPet[SPELLS.GROWL].reduce((sum, spellId) => sum + (casts[spellId] || 0), 0)
    );
  }, 0);

export default metric(growlCasts);
