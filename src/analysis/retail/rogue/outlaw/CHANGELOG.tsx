import { change, date } from 'common/changelog';
import { Moonrose, Silverkage } from 'CONTRIBUTORS';

export default [
  change(
    date(2026, 7, 25),
    'Account for the 50 extra maximum Energy from Adrenaline Rush, so Energy waste during it is measured against the right cap.',
    Moonrose,
  ),
  change(
    date(2026, 7, 25),
    'Use the shared Action Priority List problem detection, which filters out low-value problems and explains each mistake using the rotation condition that failed.',
    Moonrose,
  ),
  change(
    date(2026, 7, 25),
    'Warn when the log is not a Trickster build, since the rotational analysis follows the Trickster priority list and Fatebound is not maintained.',
    Moonrose,
  ),
  change(
    date(2026, 7, 25),
    'Align the Action Priority List with the Midnight SimulationCraft priority: Preparation, Killing Spree, Blade Flurry and the Deft Maneuvers builder.',
    Moonrose,
  ),
  change(
    date(2026, 7, 25),
    'Correct Adrenaline Rush duration and energy regeneration, the Killing Spree cooldown, Blade Flurry duration, and the abilities Restless Blades reduces.',
    Moonrose,
  ),
  change(
    date(2026, 7, 25),
    'Fix Between the Eyes cooldown tracking, which corrects the finisher combo point threshold and Killing Spree feedback.',
    Moonrose,
  ),
  change(date(2026, 7, 25), "Refresh Outlaw Rogue analysis for Midnight.", Moonrose),
  change(date(2025, 4, 17), "Update Outlaw Rogue for 12.0.1", Silverkage),
];
