import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Hartra344, Sref, ToppleTheNun, ap2355, attluh, Jundarer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2024, 4, 10), <>Fixed an issue where <SpellLink spell={TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT} /> and <SpellLink spell={TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT} /> weren't tracked properly when <SpellLink spell={TALENTS_DRUID.ORBITAL_STRIKE_TALENT} /> is talented.</>, Sref),
  change(date(2024, 1, 19), <>Marked up to date for 10.2.5</>, Sref),
  change(date(2023, 11, 13), <>Added Active Time breakdown to Incarnation casts. Added <SpellLink spell={TALENTS_DRUID.WILD_MUSHROOM_TALENT} /> usage section. Tweaked spell efficiency thresholds.</>, Sref),
  change(date(2023, 11, 12), <>Added Active Time Graph to Guide.</>, Sref),
  change(date(2023, 11, 10), <>Full overhaul of Guide, and updates for 10.2.</>, Sref),
  change(date(2023, 9, 22), <>Update Fury of Elune cooldown.</>, Jundarer),
  change(date(2023, 7, 20), <>Update for 10.1.5 and show Eclipses on timeline.</>, Jundarer),
  change(date(2023, 7, 16), <>Update FotF, dot refreshes, rattle, sotf, filler usage and other small inaccuracies.</>, Jundarer),
  change(date(2023, 6, 20), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 3, 16), <>Updated the downtime suggestion to show active downtime, rather than uptime, for clarity.</>, attluh),
  change(date(2023, 2, 6), <>Added statistics support for <SpellLink spell={TALENTS_DRUID.SUNDERED_FIRMAMENT_TALENT} /></>, ap2355 ),
  change(date(2023, 1, 27), <>Corrected <SpellLink spell={TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT} /> and <SpellLink spell={TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT} /> tracking and cooldown if <SpellLink spell={TALENTS_DRUID.ORBITAL_STRIKE_TALENT} /> is talented </>, ap2355 ),
  change(date(2023, 1, 27), <>Adjusted filler suggestions to better align with Dragonflight recommendations</>, Hartra344 ),
  change(date(2023, 1, 27), <>Added statistics support for <SpellLink spell={TALENTS_DRUID.FRIEND_OF_THE_FAE_TALENT} /></>, ap2355 ),
  change(date(2023, 1, 24), <>Added statistics support for <SpellLink spell={SPELLS.TOUCH_THE_COSMOS} /></>, ap2355 ),
  change(date(2023, 1, 24), <>Added statistics support for <SpellLink spell={TALENTS_DRUID.STARWEAVER_TALENT} /></>, ap2355 ),
  change(date(2023, 1, 23), <>Added statistics support for <SpellLink spell={SPELLS.GATHERING_STARSTUFF} /></>, ap2355 ),
  change(date(2023, 1, 18), <>Added statistics support for <SpellLink spell={TALENTS_DRUID.RATTLE_THE_STARS_TALENT} /></>, Hartra344 ),
  change(date(2023, 1, 6), <>Moved <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> from a covenant section to the general statistic section.</>, Hartra344 ),
  change(date(2022, 12, 31), <>Updated the about description to be up to date with dragonflight.</>, Hartra344 ),
  change(date(2022, 12, 31), <>Add support for <SpellLink spell={TALENTS_DRUID.WANING_TWILIGHT_TALENT} /> uptime and DPS contribution statistic</>, Hartra344 ),
  change(date(2022, 10, 17), <>Only check <SpellLink spell={TALENTS_DRUID.INNERVATE_TALENT} /> efficiency if talented into it.</>, ToppleTheNun),
  change(date(2022, 10, 17), <>Add <SpellLink spell={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> to Abilities list.</>, ToppleTheNun),
  change(date(2022, 9, 16), <>Initial updates for Dragonflight Talent system.</>, Sref),
];
