import type { Raid } from 'game/raids';
import background from './backgrounds/zone.jpg';
import Immerseus from './Immerseus';
import TheFallenProtectors from './TheFallenProtectors';
import Norushen from './Norushen';
import ShaOfPride from './ShaOfPride';
import Galakras from './Galakras';
import IronJuggernaut from './IronJuggernaut';
import KorkronDarkShaman from './KorkronDarkShaman';
import GeneralNazgrim from './GeneralNazgrim';
import Malkorok from './Malkorok';
import SpoilsOfPandaria from './SpoilsOfPandaria';
import ThokTheBloodthirsty from './ThokTheBloodthirsty';
import SiegecrafterBlackfuse from './SiegecrafterBlackfuse';
import ParagonsOfTheKlaxxi from './ParagonsOfTheKlaxxi';
import GarroshHellscream from './GarroshHellscream';

export default {
  name: 'Siege of Orgrimmar',
  background,
  bosses: {
    Immerseus,
    TheFallenProtectors,
    Norushen,
    ShaOfPride,
    Galakras,
    IronJuggernaut,
    KorkronDarkShaman,
    GeneralNazgrim,
    Malkorok,
    SpoilsOfPandaria,
    ThokTheBloodthirsty,
    SiegecrafterBlackfuse,
    ParagonsOfTheKlaxxi,
    GarroshHellscream,
  },
} satisfies Raid;
