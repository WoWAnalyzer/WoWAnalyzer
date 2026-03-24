import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
// import { TALENTS_WARLOCK } from 'common/TALENTS';
import { Katorri } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2026, 4, 3), "Overhaul Demonic Tyrant guide with weighted scoring, add Diabolist support, and improved resource/cooldown tracking in Tyrant windows.", Katorri),
  change(date(2026, 3, 20), "Add Demonic Healthstone Tracker, update guide structure, fix timestamp issues on Demonic Tyrant windows.", Katorri),
  change(date(2026, 3, 11), "Fix to show Soul Shard Graph again", Katorri),
  change(date(2026, 3, 7), <>Create <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT}></SpellLink> Analyzer to detail Demonic Tyrant windows.</>, Katorri),
  change(date(2026, 3, 6), "Add tracking for Grimoire: Imp Lord and Grimoire: Fel Ravager. Removed Demonic Tyrant Cooldown subsection as it was out of date.", Katorri),
  change(date(2026, 2, 28), "Initial pass to enable Midnight Demonology. In a very rough state, and some info is out of date.", Katorri)
];
