import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import { Abelito75 } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [   
  change(date(2019, 1, 18),<>Included Lucid dream statistic.</>,Abelito75),
  change(date(2020, 1, 15),<>Updated for 8.3 </>,Abelito75),
  change(date(2019, 11, 9),<>Fixed a bugged where precasted <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> would break a few modules. </>,Abelito75),
  change(date(2019, 10, 28),<>Added bad <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> cast highlighting to the timeline. </>,Abelito75),
  change(date(2019, 10, 3),<>Spell reflect is now based off of damage reduced. </>,Abelito75),
  change(date(2019, 9, 30),<>Removed Arcane Torrent from suggestions. </>,Abelito75),
  change(date(2019, 9, 27),<>Officially supported! </>,Abelito75),
  change(date(2019, 9, 27),<>Update to date for 8.2.5 </>,Abelito75),
  change(date(2019, 9, 18),<>Physical hits blocked now only checks blockable hits. </>,Abelito75),
  change(date(2019, 9, 4),<>Fixed a bug in <SpellLink id={SPELLS.BRACE_FOR_IMPACT.id} />. </>,Abelito75),
  change(date(2019, 9, 4),<>Changed timeformat for <SpellLink id={SPELLS.BRACE_FOR_IMPACT.id} />. </>,Abelito75),
  change(date(2019, 9, 4),<>Updated wording for <SpellLink id={SPELLS.AVATAR_TALENT.id} />.</>,Abelito75),
  change(date(2019, 8, 26),<>Added support for <SpellLink id={SPELLS.BRACE_FOR_IMPACT.id} /></>,Abelito75),
  change(date(2019, 8, 26),<>Updated spells for prot warrior to include <SpellLink id={SPELLS.BRACE_FOR_IMPACT.id} /> buff. </>,Abelito75),
  change(date(2019, 8, 24),<>Updated possible uptime on <SpellLink id={SPELLS.AVATAR_TALENT.id} /> if you are taking <SpellLink id={SPELLS.VISION_OF_PERFECTION.id} /> </>,Abelito75),
  change(date(2019, 8, 24),<>Added new <SpellLink id={SPELLS.SHIELD_BLOCK.id} /> logic to be able to determine if a shield block is good or bad from either a defensive or offensive POV.</>,Abelito75),
  change(date(2019, 8, 23),<>Updated threshold for <SpellLink id={SPELLS.HEAVY_REPERCUSSIONS_TALENT.id} /> to be humanly possible. </>,Abelito75),
  change(date(2019, 8, 22),<>Updated cooldown tracking when <SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> is talented. Also added visions of perfection so we have no more missing spell.  </>,Abelito75),
  change(date(2019, 8, 15),<>Buff tracking changed for timeline.</>,Abelito75),
  change(date(2019, 8, 15),<>Shield Slam module created for assuming possible casts.</>,Abelito75),
  change(date(2019, 8, 9),<>Big overhaul to checklist. We also have a working checklist again</>,Abelito75),
  change(date(2019, 7, 31),<>We have a supporter</>,Abelito75),
];
