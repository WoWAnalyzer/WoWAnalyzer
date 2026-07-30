import { change, date } from 'common/changelog';
import { emallson } from 'CONTRIBUTORS';

// prettier-ignore
export default [
  change(date(2026, 7, 30), 'Re-enabled the analyzer for Midnight: removed references to talents that no longer exist (Eye of Tyr, Moment of Glory, Holy Shield, Resolute Defender, Repentance, Bastion of Light, Inmost Light, Inspiring Vanguard) and fixed the Holy Armaments rename.', emallson),
  change(date(2025, 4, 27), 'More rotational work for Templar', emallson),
  change(date(2025, 4, 26), 'Added rotational analysis for Templar', emallson),
  change(date(2025, 4, 11), 'Initial updates for The War Within.', emallson),
];
