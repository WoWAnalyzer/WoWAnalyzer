import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Hartra344, Sref, ToppleTheNun, ap2355, attluh, Jundarer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2023, 3, 16), <>Update FotF, dot refreshes, rattle, sotf, filler usage and other small inaccuaries.</>, Jundarer),
  change(date(2023, 3, 16), <>Updated the downtime suggestion to show active downtime, rather than uptime, for clarity.</>, attluh),
  change(date(2023, 2, 6), <>Added statistics support for <SpellLink id={TALENTS_DRUID.SUNDERED_FIRMAMENT_TALENT} /></>, ap2355 ),
  change(date(2023, 1, 27), <>Corrected <SpellLink id={TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT} /> and <SpellLink id={TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT} /> tracking and cooldown if <SpellLink id={TALENTS_DRUID.ORBITAL_STRIKE_TALENT} /> is talented </>, ap2355 ),
  change(date(2023, 1, 27), <>Adjusted filler suggestions to better align with Dragonflight recommendations</>, Hartra344 ),
  change(date(2023, 1, 27), <>Added statistics support for <SpellLink id={TALENTS_DRUID.FRIEND_OF_THE_FAE_TALENT} /></>, ap2355 ),
  change(date(2023, 1, 24), <>Added statistics support for <SpellLink id={SPELLS.TOUCH_THE_COSMOS} /></>, ap2355 ),
  change(date(2023, 1, 24), <>Added statistics support for <SpellLink id={TALENTS_DRUID.STARWEAVER_TALENT} /></>, ap2355 ),
  change(date(2023, 1, 23), <>Added statistics support for <SpellLink id={SPELLS.GATHERING_STARSTUFF} /></>, ap2355 ),
  change(date(2023, 1, 18), <>Added statistics support for <SpellLink id={TALENTS_DRUID.RATTLE_THE_STARS_TALENT} /></>, Hartra344 ),
  change(date(2023, 1, 6), <>Moved <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> from a covenant section to the general statistic section.</>, Hartra344 ),
  change(date(2022, 12, 31), <>Updated the about description to be up to date with dragonflight.</>, Hartra344 ),
  change(date(2022, 12, 31), <>Add support for <SpellLink id={TALENTS_DRUID.WANING_TWILIGHT_TALENT} /> uptime and DPS contribution statistic</>, Hartra344 ),
  change(date(2022, 10, 17), <>Only check <SpellLink id={TALENTS_DRUID.INNERVATE_TALENT} /> efficiency if talented into it.</>, ToppleTheNun),
  change(date(2022, 10, 17), <>Add <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> to Abilities list.</>, ToppleTheNun),
  change(date(2022, 9, 16), <>Initial updates for Dragonflight Talent system.</>, Sref),
];
