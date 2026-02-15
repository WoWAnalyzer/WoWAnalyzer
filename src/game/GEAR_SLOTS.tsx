import { type JSX } from 'react';
import { Trans } from '@lingui/react/macro';

const GEAR_SLOTS = {
  HEAD: 0,
  NECK: 1,
  SHOULDER: 2,
  SHIRT: 3,
  CHEST: 4,
  WAIST: 5,
  LEGS: 6,
  FEET: 7,
  WRISTS: 8,
  HANDS: 9,
  FINGER1: 10,
  FINGER2: 11,
  TRINKET1: 12,
  TRINKET2: 13,
  BACK: 14,
  MAINHAND: 15,
  OFFHAND: 16,
  TABARD: 17,
};

export default GEAR_SLOTS;

export const GEAR_SLOT_NAMES: Record<number, JSX.Element> = {
  0: <Trans id="common.slots.head">Head</Trans>,
  1: <Trans id="common.slots.neck">Neck</Trans>,
  2: <Trans id="common.slots.shoulder">Shoulders</Trans>,
  4: <Trans id="common.slots.chest">Chest</Trans>,
  5: <Trans id="common.slots.belt">Belt</Trans>,
  6: <Trans id="common.slots.legs">Legs</Trans>,
  7: <Trans id="common.slots.boots">Boots</Trans>,
  8: <Trans id="common.slots.bracers">Bracers</Trans>,
  9: <Trans id="common.slots.hands">Gloves</Trans>,
  10: <Trans id="common.slots.ring">Ring</Trans>,
  11: <Trans id="common.slots.ring">Ring</Trans>,
  12: <Trans id="common.slots.trinket">Trinket</Trans>,
  13: <Trans id="common.slots.trinket">Trinket</Trans>,
  14: <Trans id="common.slots.cloak">Cloak</Trans>,
  15: <Trans id="common.slots.weapon">Weapon</Trans>,
  16: <Trans id="common.slots.offhand">OffHand</Trans>,
};
