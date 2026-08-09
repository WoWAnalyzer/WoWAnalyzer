import { change, date } from 'common/changelog';
import { Darkfrog, emallson } from 'CONTRIBUTORS';

export default [
  change(
    date(2026, 7, 11),
    'Added Unholy Death Knight analysis for Classic MoP: Guide; pet tracking (Gargoyle, Ghoul); disease and presence uptime trackers; Sudden Doom and Unholy Frenzy support.',
    Darkfrog,
  ),
  change(date(2024, 7, 5), 'Added basic Cataclysm support.', emallson),
];
