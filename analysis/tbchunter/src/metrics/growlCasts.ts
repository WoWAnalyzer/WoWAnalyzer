import { AnyEvent } from 'parser/core/Events';
import metric from 'parser/core/metric';
import castCount from 'parser/shared/metrics/castCount';

import * as SPELLS from '../SPELLS_PET';

/**
 * Returns the max amount of Kill Command casts considering the buff uptime.
 * Does not account for fluctuating cooldowns.
 */
const growlCasts = (events: AnyEvent[], pets: Array<{ id: number }>) =>
  pets.reduce((sum, pet) => {
    const casts = castCount(events, pet.id);

    return sum + casts[SPELLS.GROWL];
  }, 0);

export default metric(growlCasts);
