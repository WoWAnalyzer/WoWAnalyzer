import { change, date } from 'common/changelog';
import { Darkfrog, emallson } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2026, 6, 19), 'Added and expanded Unholy Death Knight analysis for Classic MoP: Guide; uptime trackers (DarkTransformationUptime, DeathAndDecayUptime, UnholyPresenceUptime); Unholy-specific modules (GargoyleTracker, GhoulAnalyzer, SuddenDoom, UnholyFrenzy); updated CombatLogParser, CONFIG, Abilities, Buffs, and CooldownThroughputTracker.', Darkfrog),
  change(date(2026, 6, 19), 'Restricted Blood Charge generator tracking to Death Coil.', Darkfrog),
  change(date(2026, 6, 19), 'Reworked Blood Tap charge waste detection to be order-independent of event log ordering.', Darkfrog),
  change(date(2024, 7, 5), 'Added basic Cataclysm support.', emallson),
];
