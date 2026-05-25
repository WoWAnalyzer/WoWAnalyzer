import { change, date } from 'common/changelog';
import {  Drowzen } from 'CONTRIBUTORS';

export default [
  change(date(2026, 5, 24), "", Drowzen),
  change(date(2026, 5, 21), "Added Tiger's Fury Windows guide subsection — per-TF cast breakdown of what you cast inside each window; energy/CPs at start are now correctly the pre-cast values, not post-energize", Drowzen),
  change(date(2026, 5, 16), "Ferocious Bite no longer flags low-Rip warnings when the target dies within 5s of the cast (verified via Rake/Rip bleed ending early — switching to a still-alive target still counts)", Drowzen),
  change(date(2026, 5, 13), "Added Sprouts of the Luminous Bloom (Midnight S1) tier set statistic", Drowzen),
  change(date(2026, 5, 8), "Added Unseen Predator (apex talent) statistic + Stalking Predator stack tracking", Drowzen),
  change(date(2026, 5,4), "Fixed Frantic Frenzy target tracking, SA + Convoke bug fixes, Updated default report", Drowzen),
  change(date(2026, 4, 12), "Fixed Sudden Ambush spell ID issues + tracking updates, updated tracking for DOTs", Drowzen),
  change(date(2026, 3, 15), "Added initial Chomp and Frantic Frenzy Support", Drowzen),
  change(date(2026, 3, 7,), "Initial Midnight update to activate Feral", Drowzen),
];
