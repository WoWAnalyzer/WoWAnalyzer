import type { Raid } from 'game/raids';

import { Ansurek } from './Ansurek';
import { BloodboundHorror } from './BloodboundHorror';
import { Kyveza } from './Kyveza';
import { Ovinax } from './Ovinax';
import { Rashanan } from './Rashanan';
import { Sikran } from './Sikran';
import { SilkenCourt } from './SilkenCourt';
import { Ulgrax } from './Ulgrax';
import background from './backgrounds/NerubarPalace.jpg';

export default {
  name: "Nerub'ar Palace",
  background,
  bosses: {
    Ansurek,
    BloodboundHorror,
    Kyveza,
    Ovinax,
    Rashanan,
    Sikran,
    SilkenCourt,
    Ulgrax,
  },
} satisfies Raid;
