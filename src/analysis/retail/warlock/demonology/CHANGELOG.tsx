import { change, date } from 'common/changelog';
// import SPELLS from 'common/SPELLS';
// import { TALENTS_WARLOCK } from 'common/TALENTS';
import { Katorri} from 'CONTRIBUTORS';
// import { SpellLink } from 'interface';

export default [
  change(date(2026, 3, 6), "Add tracking for Grimoire: Imp Lord and Grimoire: Fel Ravager. Removed Demonic Tyrant Cooldown subsection as it was out of date.", Katorri),
  change(date(2026, 2, 28), "Initial pass to enable Midnight Demonology. In a very rough state, and some info is out of date.", Katorri)
];