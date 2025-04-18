import { Trans } from '@lingui/react/macro';
import BaseGemChecker from 'parser/shared/modules/items/GemChecker';

const GEMABLE_SLOTS = {
  0: <Trans id="common.slots.head">Head</Trans>,
  1: <Trans id="common.slots.neck">Neck</Trans>,
  4: <Trans id="common.slots.chest">Chest</Trans>,
  5: <Trans id="common.slots.belt">Belt</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  8: <Trans id="common.slots.bracers">Bracers</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};

class GemChecker extends BaseGemChecker {
  get GemableSlots(): Record<number, JSX.Element> {
    return GEMABLE_SLOTS;
  }
}

export default GemChecker;
