import Background from './backgrounds/Amirdrassil.png';
import Gnarlroot from 'game/raids/amirdrassil/Gnarlroot';
import Igira from 'game/raids/amirdrassil/Igira';
import Volcoross from 'game/raids/amirdrassil/Volcoross';
import CouncilOfDreams from 'game/raids/amirdrassil/CouncilOfDreams';
import Larodar from 'game/raids/amirdrassil/Larodar';
import Nymue from 'game/raids/amirdrassil/Nymue';
import Smolderon from 'game/raids/amirdrassil/Smolderon';
import Tindral from 'game/raids/amirdrassil/Tindral';
import Fyrakk from 'game/raids/amirdrassil/Fyrakk';
import type { Raid } from 'game/raids';

export default {
  name: "Amirdrassil, the Dream's Hope",
  background: Background,
  bosses: {
    Gnarlroot,
    Igira,
    Volcoross,
    CouncilOfDreams,
    Larodar,
    Nymue,
    Smolderon,
    Tindral,
    Fyrakk,
  },
} satisfies Raid;
