import { change, date } from 'common/changelog';
import { Darkfrog, jazminite } from 'CONTRIBUTORS';

export default [
  change(
    date(2026, 6, 19),
    'Added and expanded Frost Death Knight analysis for Classic MoP: Guide; rune/runic power tracking; efficiency/waste trackers; disease uptime trackers; Evil Eye of Galakras support.',
    Darkfrog,
  ),
  change(date(2026, 6, 19), 'Fixed incorrect Killing Machine spell ID.', Darkfrog),
  change(
    date(2026, 6, 19),
    'Reworked Blood Tap charge waste detection to be order-independent of event log ordering.',
    Darkfrog,
  ),
  change(date(2023, 5, 25), 'Add missing Frost DK abilities.', jazminite),
  change(date(2023, 4, 14), 'Initial guide for Classic Frost Death Knight.', jazminite),
];
