import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import { Tyndi, Zeboot, Putro, Hordehobbs, Akai, Chizu, ToppleTheNun, Anty } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022,11, 5), <>Enabling Spec for Dragonflight.</>, Anty),
  change(date(2022, 10, 31), 'Update to reflect that Subtlety Rogue has been looked at for Dragonflight.', ToppleTheNun),
  change(date(2022, 10, 15), 'Initial support for Dragonflight - cleanup of old effects', Chizu),
  change(date(2022, 3, 6), <>Bump to partial support for 9.2</>, Tyndi),
  change(date(2021, 8, 12), <>Added <SpellLink id={TALENTS.FLAGELLATION_TALENT.id} /> suggestion in overview section. Fixed Flagellation damage in statistics section.</>, Akai),
  change(date(2021, 5, 2), <>Fix bug in Sepsis analyzer in mythic plus analysis.</>, Hordehobbs),
  change(date(2021, 4, 25), <>Added additional functionality to <SpellLink id={TALENTS.SEPSIS_TALENT.id} /> analyzers. </>, Hordehobbs),
  change(date(2021,2,27), <>Add analyzer and suggestion for <SpellLink id={SPELLS.INSTANT_POISON.id} /> application.</>, Hordehobbs),
  change(date(2021, 1, 23), "Add GeneratorFollowingVanish analyzer.", Hordehobbs),
  change(date(2021, 1, 23), "Update CastsInShadowDance analyzer for proper value of max possible casts.", Hordehobbs),
  change(date(2021, 1, 23), <>Remove <SpellLink id={SPELLS.VANISH.id} /> as an offensive CD from checklist. </>, Hordehobbs),
  change(date(2021, 1, 23), "Update DeepeningShadows analyzer for new CDR values.", Hordehobbs),
  change(date(2020, 12, 27), <>Added analyzer for tracking <SpellLink id={SPELLS.VANISH.id} /> usage in conjunction with refreshing <SpellLink id={SPELLS.FIND_WEAKNESS.id} />. </>, Hordehobbs),
  change(date(2020, 12, 21), 'Minor update to suggestions', Tyndi),
  change(date(2020, 12, 18), <> Fixed an issue where the analyzer couldn't reduce the cooldown of <SpellLink id={SPELLS.SERRATED_BONE_SPIKE.id} />. </>, Putro),
  change(date(2020, 10, 27), 'Converted modules to TypeScript; Updated Statistic Boxes', Tyndi),
  change(date(2020, 10, 20), <>Added <SpellLink id={SPELLS.INVIGORATING_SHADOWDUST.id} /> Legendary</>, Tyndi),
  change(date(2020, 10, 19), <>Added <SpellLink id={SPELLS.ESSENCE_OF_BLOODFANG.id} /> Legendary</>, Tyndi),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 16), <>Added <SpellLink id={SPELLS.THE_ROTTEN.id} /> Legendary. And Removed Nightblade.</>, Tyndi),
  change(date(2020, 10, 2), 'Added Akaari\'s Soul Fragment Legendary', Tyndi),
];
