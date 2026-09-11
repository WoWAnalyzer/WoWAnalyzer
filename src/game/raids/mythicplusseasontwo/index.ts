import type { Raid } from 'game/raids';
import { buildBoss } from 'game/raids/builders';
import AltarOfFangs from './backgrounds/AltarOfFangs.jpg';
import DenOfNalorakk from './backgrounds/DenOfNalorakk.jpg';
import KingsRest from './backgrounds/KingsRest.jpg';
import MurderRow from './backgrounds/MurderRow.jpg';
import RubyLifePools from './backgrounds/RubyLifePools.jpg';
import TempleOfSethraliss from './backgrounds/TempleOfSethraliss.jpg';
import TheBlindingVale from './backgrounds/TheBlindingVale.jpg';
import VoidscarArena from './backgrounds/VoidscarArena.jpg';

export default {
  name: 'Mythic+ Season 2',
  bosses: {
    AltarOfFangs: buildBoss({
      id: 12993,
      name: 'Altar of Fangs',
      background: AltarOfFangs,
    }),
    DenOfNalorakk: buildBoss({
      id: 12825,
      name: 'Den of Nalorakk',
      background: DenOfNalorakk,
    }),
    KingsRest: buildBoss({
      id: 61762,
      name: "King's Rest",
      background: KingsRest,
    }),
    MurderRow: buildBoss({
      id: 12813,
      name: 'Murder Row',
      background: MurderRow,
    }),
    RubyLifePools: buildBoss({
      id: 112521,
      name: 'Ruby Life Pools',
      background: RubyLifePools,
    }),
    TempleOfSethraliss: buildBoss({
      id: 61877,
      name: 'Temple of Sethraliss',
      background: TempleOfSethraliss,
    }),
    TheBlindingVale: buildBoss({
      id: 12859,
      name: 'The Blinding Vale',
      background: TheBlindingVale,
    }),
    VoidscarArena: buildBoss({
      id: 12923,
      name: 'Voidscar Arena',
      background: VoidscarArena,
    }),
  },
} satisfies Raid;
