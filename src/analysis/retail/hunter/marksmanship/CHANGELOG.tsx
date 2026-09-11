import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_HUNTER } from 'common/TALENTS/hunter';
import { Azortharion, Arlie } from 'CONTRIBUTORS';
import { SpellLink } from 'interface/index';
export default [
  change(
    date(2026, 8, 6),
  <>
    Update for 12.1.0.69111 PTR talent changes (Incendiary Ammunition removed, Explosive Shot cooldown fixed at 30s).
  </>,
    Arlie,
  ),
  change(
    date(2026, 7, 15),
    <>
      Added a rule flagging <SpellLink spell={SPELLS.ARCANE_SHOT} /> and{' '}
      <SpellLink spell={SPELLS.MULTISHOT_MM} /> casts made without{' '}
      <SpellLink spell={TALENTS_HUNTER.PRECISE_SHOTS_TALENT} /> active (with exceptions for{' '}
      <SpellLink spell={SPELLS.MULTISHOT_MM} /> and{' '}
      <SpellLink spell={TALENTS_HUNTER.BLACK_ARROW_MARKSMANSHIP_TALENT} /> turning on{' '}
      <SpellLink spell={SPELLS.TRICK_SHOTS_BUFF} /> from cold), plus a statistic counter for these
      mistakes. Also fixed the <SpellLink spell={SPELLS.DEATHBLOW_BUFF} /> proc counter, which was
      undercounting procs
    </>,
    Azortharion,
  ),
  change(
    date(2026, 7, 15),
    <>
      Corrected <SpellLink spell={TALENTS_HUNTER.TRUESHOT_TALENT} />'s{' '}
      <SpellLink spell={TALENTS_HUNTER.AIMED_SHOT_TALENT} /> and{' '}
      <SpellLink spell={TALENTS_HUNTER.RAPID_FIRE_TALENT} /> cooldown recharge-rate bonuses, which
      were drastically overtuned (225%/240% instead of 40%/60%), causing both cooldowns to recover
      far too quickly during Trueshot
    </>,
    Azortharion,
  ),
  change(
    date(2026, 7, 15),
    <>
      Added tracking for <SpellLink spell={TALENTS_HUNTER.WAILING_DEAD_TALENT} />'s{' '}
      <SpellLink spell={SPELLS.WAILING_ARROW_DAMAGE} />: proper cooldown/GCD tracking (it had
      neither), a flag for casting it while a <SpellLink spell={SPELLS.DEATHBLOW_BUFF} /> proc was
      already active, and a counter for Trueshot windows where it wasn't cast
    </>,
    Azortharion,
  ),
  change(
    date(2026, 7, 15),
    <>
      Added cooldown/GCD tracking for <SpellLink spell={TALENTS_HUNTER.EXPLOSIVE_SHOT_TALENT} />{' '}
      (it had neither) and added preliminary support for its upcoming Incendiary Ammunition rework
    </>,
    Azortharion,
  ),
  change(
    date(2026, 7, 15),
    <>
      Removed a stale special case that halved <SpellLink spell={SPELLS.ARCANE_SHOT} />'s GCD
      while <SpellLink spell={TALENTS_HUNTER.PRECISE_SHOTS_TALENT} /> was active - that mechanic no
      longer exists, and the leftover code was causing fake downtime on the Timeline
    </>,
    Azortharion,
  ),
  change(
    date(2026, 7, 15),
    <>
      Statistic cleanup: removed the now-inaccurate{' '}
      <SpellLink spell={TALENTS_HUNTER.NATURAL_MENDING_TALENT} /> cooldown-reduction statistic
      (replaced with the correct flat 60s <SpellLink spell={SPELLS.EXHILARATION} /> cooldown),
      removed the <SpellLink spell={TALENTS_HUNTER.VOLLEY_TALENT} /> damage statistic, swapped{' '}
      <SpellLink spell={TALENTS_HUNTER.SURGING_SHOTS_TALENT} />'s damage statistic for its{' '}
      <SpellLink spell={TALENTS_HUNTER.RAPID_FIRE_TALENT} /> reset count, and hid the "possible
      focus gained" and "wasted generator Focus" statistics (underlying tracking kept intact)
    </>,
    Azortharion,
  ),
];
