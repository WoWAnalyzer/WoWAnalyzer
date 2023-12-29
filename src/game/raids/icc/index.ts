import Marrowgar from 'game/raids/icc/Marrowgar';
import Deathwhisper from 'game/raids/icc/Deathwhisper';
import Gunship from 'game/raids/icc/Gunship';
import Saurfang from 'game/raids/icc/Saurfang';
import Festergut from 'game/raids/icc/Festergut';
import Rotface from 'game/raids/icc/Rotface';
import Putricide from 'game/raids/icc/Putricide';
import BloodCouncil from 'game/raids/icc/BloodCouncil';
import BloodQueen from 'game/raids/icc/BloodQueen';
import Dreamwalker from 'game/raids/icc/Dreamwalker';
import Sindragosa from 'game/raids/icc/Sindragosa';
import LichKing from 'game/raids/icc/LichKing';
import type { Raid } from 'game/raids';

export default {
  name: 'Icecrown Citadel',
  bosses: {
    Marrowgar,
    Deathwhisper,
    Gunship,
    Saurfang,
    Festergut,
    Rotface,
    Putricide,
    BloodCouncil,
    BloodQueen,
    Dreamwalker,
    Sindragosa,
    LichKing,
  },
} satisfies Raid;
