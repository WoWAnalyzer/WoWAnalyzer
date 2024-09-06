import { Options } from 'parser/core/Module';
import { TALENTS_PRIEST } from 'common/TALENTS';
import HotTracker, { HotInfo, Tracker } from 'parser/shared/modules/HotTracker';
import {
  LIGHTWELL_RENEW,
  BENEDICTION_RENEW,
  HARDCAST_RENEW,
  SALVATION_RENEW,
  REVIT_PRAYER_RENEW,
} from '../../../../normalizers/CastLinkNormalizer';

const BASE_RENEW_DURATION = 15;
//not sure what the max is, df s3 tier could extend it to like 2min
const MAX_RENEW_DURATION = 50;

class RenewTracker extends HotTracker {
  static dependencies = {
    ...HotTracker.dependencies,
  };

  constructor(options: Options) {
    super(options);
    this.active = this.owner.selectedCombatant.hasTalent(TALENTS_PRIEST.RENEW_TALENT);
  }

  fromSalv(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === SALVATION_RENEW;
    });
  }

  fromHardCastRenew(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === HARDCAST_RENEW;
    });
  }

  fromPrayerOfMending(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === BENEDICTION_RENEW;
    });
  }

  fromLightWellRenew(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === LIGHTWELL_RENEW;
    });
  }

  fromRevitPrayer(hot: Tracker): boolean {
    return hot.attributions.some(function (attr) {
      return attr.name === REVIT_PRAYER_RENEW;
    });
  }

  _generateHotInfo(): HotInfo[] {
    return [
      {
        spell: TALENTS_PRIEST.RENEW_TALENT,
        duration: BASE_RENEW_DURATION,
        tickPeriod: 3000,
        maxDuration: MAX_RENEW_DURATION,
      },
    ];
  }
}

export default RenewTracker;
