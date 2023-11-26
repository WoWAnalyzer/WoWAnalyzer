import { CastEvent, EventType } from 'parser/core/Events';
import { isDefined } from 'common/typeGuards';
import {
  getRelatedBuffApplicationFromHardcast,
  getDebuffApplicationFromHardcast,
  getSepsisConsumptionCastForBuffEvent,
  getAuraLifetimeEvent,
} from '../../normalizers/SepsisLinkNormalizer';
import {
  SEPSIS_DEBUFF_DURATION,
  SEPSIS_BUFF_DURATION,
} from '../../normalizers/SepsisLinkNormalizer';
import { BUFF_DROP_BUFFER } from 'parser/core/DotSnapshots';
import SepsisCast from './interfaces/SepsisCast';
import SepsisDebuff from './interfaces/SepsisDebuff';
import { PRIMARY_BUFF_KEY, SECONDARY_BUFF_KEY } from './Sepsis';

const onSepsisCast = (cast: CastEvent, overallSepsisCasts: SepsisCast[]) => {
  const sepsisBuffs: SepsisCast['buffs'] = {
    [PRIMARY_BUFF_KEY]: undefined,
    [SECONDARY_BUFF_KEY]: undefined,
  };
  let sepsisDebuff: SepsisDebuff | undefined;

  const initialBuffApplication = getRelatedBuffApplicationFromHardcast(
    cast,
    'InstantAuraApplication',
  );
  const delayedBuffApplication = getRelatedBuffApplicationFromHardcast(
    cast,
    'DelayedAuraApplication',
  );
  const debuffApplication = getDebuffApplicationFromHardcast(cast);

  [initialBuffApplication, delayedBuffApplication, debuffApplication]
    .filter(isDefined)
    .forEach((application) => {
      const isBuff = application.type === EventType.ApplyBuff;
      const start = application.timestamp;
      const expectedDuration = isBuff ? SEPSIS_BUFF_DURATION : SEPSIS_DEBUFF_DURATION;
      const removal = getAuraLifetimeEvent(application);
      const end = removal ? removal.timestamp : start + expectedDuration; // default to full duration
      const activeDuration = end - start;
      const timeRemainingOnRemoval = expectedDuration - activeDuration;
      if (isBuff) {
        const consumeCast = getSepsisConsumptionCastForBuffEvent(application);
        const buffId =
          Math.abs(cast.timestamp - start) <= BUFF_DROP_BUFFER
            ? PRIMARY_BUFF_KEY
            : SECONDARY_BUFF_KEY;
        sepsisBuffs[buffId] = {
          applyEvent: application,
          timeRemainingOnRemoval,
          consumeCast,
          start,
          end,
        };
      } else {
        // application isDebuff
        sepsisDebuff = {
          applyEvent: application,
          timeRemainingOnRemoval,
          start,
          end,
        };
      }
    });
  overallSepsisCasts.push({
    event: cast,
    buffs: sepsisBuffs,
    debuff: sepsisDebuff,
  });
};

export default onSepsisCast;
