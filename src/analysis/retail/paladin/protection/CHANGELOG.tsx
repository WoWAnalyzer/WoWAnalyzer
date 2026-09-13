import { change, date } from 'common/changelog';
import { apolex, Baloop, emallson } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2026, 9, 6), 'Added missing Midnight spell data (tier set bonuses, apex talent procs, hero tree auras) and corrected Hammer of Light\'s Holy Power cost to 3.', Baloop),
  change(date(2026, 9, 6), 'Removed dead legacy modules (Light of the Protector, Sanctified Wrath, Divine Toll shim) and leftover Suggestions-era code.', Baloop),
  change(date(2026, 9, 6), 'Added Sentinel to the mitigation check, repaired the Word of Glory timing tab, and corrected the downtime grading thresholds.', Baloop),
  change(date(2026, 9, 6), 'Fixed the Lightsmith rotation warning showing for players without the Lightsmith hero tree, and refreshed the spec description and example report.', Baloop),
  change(date(2026, 7, 30), 'Re-enabled the analyzer for Midnight: removed references to talents that no longer exist (Eye of Tyr, Moment of Glory, Holy Shield, Resolute Defender, Repentance, Bastion of Light, Inmost Light, Inspiring Vanguard) and fixed the Holy Armaments rename.', apolex),
  change(date(2025, 4, 27), 'More rotational work for Templar', emallson),
  change(date(2025, 4, 26), 'Added rotational analysis for Templar', emallson),
  change(date(2025, 4, 11), 'Initial updates for The War Within.', emallson),
];
