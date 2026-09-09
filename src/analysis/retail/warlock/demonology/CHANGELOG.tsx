import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
// import { TALENTS_WARLOCK } from 'common/TALENTS';
import { Katorri, Zea } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

export default [
  change(date(2026, 9, 9), <>Add a "What to Focus On" section at the top of the guide. It ranks up to four changes by impact: uptime, <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT} /> window quality, cooldown timing, Soul Shard waste, and more.</>, Zea),
  change(date(2026, 9, 9), "Remove Charhound and Gloomhound from the cast efficiency list. Call Dreadstalkers summons them in 12.1, so they are not casts.", Zea),
  change(date(2026, 8, 18), "Update compatibility for 12.1", Katorri),
  change(date(2026, 4, 23), "Update spec Compatibility for 12.0.5", Katorri),
  change(date(2026, 4, 3), "Overhaul Demonic Tyrant guide with weighted scoring, add Diabolist support, and improved resource/cooldown tracking in Tyrant windows.", Katorri),
  change(date(2026, 3, 20), "Add Demonic Healthstone Tracker, update guide structure, fix timestamp issues on Demonic Tyrant windows.", Katorri),
  change(date(2026, 3, 11), "Fix to show Soul Shard Graph again", Katorri),
  change(date(2026, 3, 7), <>Create <SpellLink spell={SPELLS.SUMMON_DEMONIC_TYRANT}></SpellLink> Analyzer to detail Demonic Tyrant windows.</>, Katorri),
  change(date(2026, 3, 6), "Add tracking for Grimoire: Imp Lord and Grimoire: Fel Ravager. Removed Demonic Tyrant Cooldown subsection as it was out of date.", Katorri),
  change(date(2026, 2, 28), "Initial pass to enable Midnight Demonology. In a very rough state, and some info is out of date.", Katorri)
];
