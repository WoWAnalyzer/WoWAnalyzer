import { change, date } from 'common/changelog';
import { TALENTS_HUNTER } from 'common/TALENTS/hunter';
import { Azortharion, Putro, SheenMachine} from 'CONTRIBUTORS';
import { SpellLink } from 'interface/index';
export default [
  change(
    date(2026, 7, 9),
    <>
      Added tracking for <SpellLink spell={TALENTS_HUNTER.PACK_MENTALITY_TALENT} />'s Barbed Shot
      cooldown reduction from Howl of the Pack Leader beast summons
    </>,
    Azortharion,
  ),
  change(
    date(2026, 7, 9),
    <>
      Added tracking for <SpellLink spell={TALENTS_HUNTER.NATURES_ALLY_3_BEAST_MASTERY_TALENT} />,
      flagging <SpellLink spell={TALENTS_HUNTER.KILL_COMMAND_BEAST_MASTERY_TALENT} /> casts made
      without its buff, and added a warning for casting{' '}
      <SpellLink spell={TALENTS_HUNTER.COBRA_SHOT_TALENT} /> while{' '}
      <SpellLink spell={TALENTS_HUNTER.BARBED_SHOT_TALENT} /> was available
    </>,
    Azortharion,
  ),
  change(
    date(2026, 7, 9),
    <>
      Fixed the Dire Beast summon spell ID (it had gone stale) and added source labeling so the
      Timeline shows whether a Dire Beast came from the Beast Mastery 4-set bonus or{' '}
      <SpellLink spell={TALENTS_HUNTER.DIRE_COMMAND_TALENT} />, instead of every summon showing
      the same generic icon
    </>,
    Azortharion,
  ),
  change(
    date(2026, 7, 9),
    <>
      Fixed <SpellLink spell={TALENTS_HUNTER.BARBED_SHOT_TALENT} /> cooldown (12s → 18s) and{' '}
      <SpellLink spell={TALENTS_HUNTER.BESTIAL_WRATH_TALENT} /> cooldown (90s → 30s when The Beast
      Within is talented, 90s base otherwise). Also removed dead cooldown-reduction tracking code
      on Bestial Wrath, fixed{' '}
      <SpellLink spell={TALENTS_HUNTER.COBRA_SHOT_TALENT} />'s Kill Command cooldown reduction to
      correctly account for Kill Command's second charge, and fixed a bug where Wild Instincts'
      free Barbed Shot proc (from Thundering Hooves) could hide Bestial Wrath's own Timeline entry
      and incorrectly consume a real Barbed Shot charge
    </>,
    Azortharion,
  ),
  change(
    date(2026, 7, 9),
    <>
      Removed <SpellLink spell={TALENTS_HUNTER.MISDIRECTION_TALENT} /> from the Timeline's
      cooldown lanes - it's still tracked for accuracy, just no longer shown as its own row since
      nobody is trying to weave it optimally
    </>,
    Azortharion,
  ),
  change(date(2026, 5, 23), "Fixed some issues with focus regeneration analyzers", Putro),
  change(date(2026, 5, 23), <>Added support for <SpellLink spell={TALENTS_HUNTER.BARBED_SCALES_TALENT} />, <SpellLink spell={TALENTS_HUNTER.DIRE_COMMAND_TALENT} /> and <SpellLink spell={TALENTS_HUNTER.WAR_ORDERS_TALENT} />  </>, Putro),
  change(date(2026, 4, 14), "Remove more outdated spells and modules", SheenMachine),
  change(date(2026, 4, 12), "Remove Dire Beast module", SheenMachine),
  change(date(2026, 4, 9), "Remove Kill Shot module", SheenMachine),
  change(date(2026, 4, 4), "Begin removing some outdated modules and components that are no longer relevant in Midnight", Putro),
  change(date(2026, 4, 2) , "Enable the spec to load in 12.0.5", Putro),
];
