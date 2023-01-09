
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest'
import { Abelito75, Adoraci, Khadaj, Sharrq, Zeboot, Pink, Hana, Vetyst, DoxAshe } from 'CONTRIBUTORS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { ResourceLink } from 'interface';

export default [
  change(date(2023, 1, 8), <>Setup an initial version of Guide </>,DoxAshe),
  change(date(2022, 12, 29), <>Created statistics for <SpellLink id={TALENTS.IDOL_OF_CTHUN_TALENT}/>, <SpellLink id={TALENTS.IDOL_OF_NZOTH_TALENT}/>, <SpellLink id={TALENTS.IDOL_OF_YOGG_SARON_TALENT}/>, and <SpellLink id={TALENTS.IDOL_OF_YSHAARJ_TALENT}/> </>,DoxAshe),
  change(date(2022, 12, 20), <>Added <SpellLink id={TALENTS.MIND_FLAY_INSANITY_TALENT}/> to proc checklist</>,DoxAshe),
  change(date(2022, 12, 12), <>Improved tracking of buffs in timelines and added <SpellLink id={TALENTS.DARK_ASCENSION_TALENT}/> and <SpellLink id={SPELLS.VOIDFORM}/> to tracked cooldowns</>,DoxAshe),
  change(date(2022, 12, 7), <>Fixed error with <SpellLink id={TALENTS.DARK_EVANGELISM_TALENT}/> if the buff exists prepull</>,DoxAshe),
  change(date(2022, 11, 29), <>Improved proc checklist section and fixed some missing icons for the procs </>,DoxAshe),
  change(date(2022, 11, 24), <>Added checklist section and suggestions for using procs </>,DoxAshe),
  change(date(2022, 11, 15), <>Added support for new Dragonflight talents</>,DoxAshe),
  change(date(2022, 11, 6), <>Updated spells and talents for Dragonflight</>,DoxAshe),
  change(date(2022, 8, 9), <>Implemented <SpellLink id={SPELLS.DARK_THOUGHTS.id} /> and <SpellLink id={SPELLS.VOIDFORM.id} /> max charge changes.</>, Vetyst),
  change(date(2022, 5, 4), <>Implemented <SpellLink id={TALENTS.TRANSLUCENT_IMAGE_TALENT.id} /> damage reduction values.</>, Hana),
  change(date(2021, 10, 21), <>Updated <SpellLink id={SPELLS.DESPERATE_PRAYER.id} /> to TypeScript.</>, Adoraci),
  change(date(2021, 10, 19), <>Fixed <SpellLink id={SPELLS.DISSONANT_ECHOES.id} />, <SpellLink id={SPELLS.DARK_THOUGHTS.id} />, and <SpellLink id={TALENTS.UNFURLING_DARKNESS_TALENT.id} /> proc usage calculation.</>, Adoraci),
  change(date(2021, 8, 27), <>Bump support to 9.1</>, Pink),
  change(date(2021, 8, 27), <>Reduced <SpellLink id={SPELLS.TALBADARS_STRATAGEM.id} /> damage increase from 60% to 55%. </>, Pink),
  change(date(2021, 8, 27), <>Reduced <SpellLink id={SPELLS.VOID_BOLT.id} /> damage increase from <SpellLink id={SPELLS.DISSONANT_ECHOES.id} /> from 35% to 15%. </>, Pink),
  change(date(2021, 4, 11), <>Updated <SpellLink id={SPELLS.GUARDIAN_FAERIE.id} /> damage reduction to 20% and corrected DR calculation.</>, Adoraci),
  change(date(2021, 4, 11), <>Removed <SpellLink id={SPELLS.ARCANE_TORRENT_MANA3.id} /> suggestion.</>, Adoraci),
  change(date(2021, 4, 11), <>Added <SpellLink id={SPELLS.VOID_BOLT.id} /> cast efficiency module.</>, Adoraci),
  change(date(2021, 4, 1), <>Bump support to 9.0.5</>, Adoraci),
  change(date(2021, 1, 29), <>Added <SpellLink id={SPELLS.HAUNTING_APPARITIONS.id} /> conduit module.</>, Adoraci),
  change(date(2021, 1, 23), <>Added SpellLink id=SPELLS.SEARING_NIGHTMARE_TALENT.id talent module.</>, Adoraci),
  change(date(2021, 1, 23), <>Changed DOT uptime tracker into better looking StatisticBar.</>, Adoraci),
  change(date(2021, 1, 23), <>Added <SpellLink id={SPELLS.ETERNAL_CALL_TO_THE_VOID.id} /> legendary.</>, Adoraci),
  change(date(2021, 1, 23), <>Added <SpellLink id={SPELLS.TALBADARS_STRATAGEM.id} /> legendary.</>, Adoraci),
  change(date(2021, 1, 23), <>Added <SpellLink id={SPELLS.TWINS_OF_THE_SUN_PRIESTESS.id} /> legendary.</>, Adoraci),
  change(date(2021, 1, 23), <>Updated checklist to include <SpellLink id={TALENTS.POWER_INFUSION_TALENT.id} />.</>, Adoraci),
  change(date(2021, 1, 23), <>Added support for <SpellLink id={TALENTS.SHADOW_WORD_DEATH_TALENT.id} />.</>, Adoraci),
  change(date(2021, 1, 23), <>Added <ResourceLink id={RESOURCE_TYPES.INSANITY.id} /> tracker and suggestions.</>, Adoraci),
  change(date(2021, 1, 23), <>Added suggestion threshold for <SpellLink id={TALENTS.DEATH_AND_MADNESS_TALENT.id} /> talent module.</>, Adoraci),
  change(date(2021, 1, 20), <>Adding support for <SpellLink id={SPELLS.BOON_OF_THE_ASCENDED.id} /></>, Khadaj),
  change(date(2021, 1, 18), <>Fixed an issue with <SpellLink id={TALENTS.VOID_TORRENT_TALENT.id} /> module crashing.</>, Adoraci),
  change(date(2020, 12, 28), <>Adding support for <SpellLink id={TALENTS.MINDGAMES_TALENT.id} /></>, Khadaj),
  change(date(2020, 12, 28), <>Adding support for <SpellLink id={SPELLS.FAE_GUARDIANS.id} /></>, Khadaj),
  change(date(2020, 12, 28), <>Added <SpellLink id={SPELLS.DISSONANT_ECHOES.id} /> conduit module.</>, Adoraci),
  change(date(2020, 12, 28), <>Adding support for <SpellLink id={SPELLS.UNHOLY_NOVA.id} /></>, Khadaj),
  change(date(2020, 12, 24), <>Updated <SpellLink id={TALENTS.VOID_TORRENT_TALENT.id} /> and <SpellLink id={TALENTS.SHADOW_CRASH_TALENT.id} /> insanity generation statistics for their modules.</>, Adoraci),
  change(date(2020, 12, 24), <>Added <SpellLink id={SPELLS.DEVOURING_PLAGUE.id} /> uptime tracker.</>, Adoraci),
  change(date(2020, 12, 24), <>Added <SpellLink id={SPELLS.BOON_OF_THE_ASCENDED.id} />, <SpellLink id={SPELLS.UNHOLY_NOVA.id} />, <SpellLink id={TALENTS.MINDGAMES_TALENT.id} />, and <SpellLink id={SPELLS.FAE_GUARDIANS.id} /> efficiency recommendations.</>, Adoraci),
  change(date(2020, 12, 23), <>Added cooldowns section which includes <SpellLink id={SPELLS.VOIDFORM_BUFF.id} />, <SpellLink id={TALENTS.POWER_INFUSION_TALENT.id} />, and <SpellLink id={SPELLS.BOON_OF_THE_ASCENDED.id} />.</>, Adoraci),
  change(date(2020, 12, 23), <>Added <SpellLink id={SPELLS.DARK_THOUGHTS.id} /> module.</>, Adoraci),
  change(date(2020, 12, 22), <>Added SpellLink id=TALENTS.FORTRESS_OF_THE_MIND_TALENT.id, <SpellLink id={TALENTS.DEATH_AND_MADNESS_TALENT.id} />, and <SpellLink id={TALENTS.UNFURLING_DARKNESS_TALENT.id} /> modules.</>, Adoraci),
  change(date(2020, 12, 21), <>Corrected spell cooldowns and ID changes from launch.</>, Adoraci),
  change(date(2020, 12, 10), <>Corrected Power Infusion spell ID.</>, Abelito75),
  change(date(2020, 10, 23), <>Update example log to more recent one.</>, Adoraci),
  change(date(2020, 10, 18), <>Converted legacy listeners to new event filters</>, Zeboot),
  change(date(2020, 10, 17), <>Updated for Shadowlands Pre-Patch.</>, Adoraci),
  change(date(2020, 9, 21), <>Removed Azerite Traits and Added Event Listeners, Centralized Constants, and Integration Tests. </>, Sharrq),
];
