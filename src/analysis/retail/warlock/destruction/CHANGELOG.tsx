import { change, date } from 'common/changelog';
import {Katorri} from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';

// prettier-ignore
export default [
  change(date(2026, 9, 10), <><SpellLink spell={SPELLS.HAVOC} /> Guide Update: now accounts for <SpellLink spell={TALENTS.SHADOWBURN_TALENT} /> usage in execute range and free <SpellLink spell={TALENTS.FIENDISH_CRUELTY_TALENT} /> usage, rates windows
by shard-weighted spend instead of flat cast count, tracks Soul Shards banked at cast time, and recovers windows cast before the pull. Update example report and about description.</>, Katorri),
  change(date(2026, 8, 26), "Fix typo in Dot Uptimes", Katorri),
  change(date(2026, 8, 18), "Update compatibility for 12.1", Katorri),
  change(date(2026, 4, 21), "Spec compatibility updated for 12.0.5", Katorri),
  change(date(2026, 3, 28), "Add Backdraft analyzer and guide. Updated from Partial to Full support", Katorri),
  change(date(2026, 3, 20), "Add Demonic Healthstone Tracker, update guide structure.", Katorri),
  change(date(2026, 3, 8), "Created Guide, ImmolateUptime tracker, Havoc Analyzer, and new CooldownUsage section.", Katorri),
  change(date(2026, 2, 13), "Enable spec. No Apex talent support currently.", Katorri),

];
