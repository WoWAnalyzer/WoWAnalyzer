import { change, date } from 'common/changelog';
import SpellLink from 'interface/SpellLink';
import TALENTS from 'common/TALENTS/demonhunter';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS/demonhunter';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { ResourceLink } from 'interface';

// prettier-ignore
export default [
  change(date(2023, 11, 6), 'Mark as updated for 10.2.', ToppleTheNun),
  change(date(2023, 10, 9), 'Update ability cooldowns and scaling in spellbooks.', ToppleTheNun),
  change(date(2023, 10, 9), 'Start updating for 10.2.', ToppleTheNun),
  change(date(2023, 7, 26), 'Remove broken i18n messags.', ToppleTheNun),
  change(date(2023, 6, 19), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 4, 29), 'Update SpellLink to use "spell" instead of "id".', ToppleTheNun),
  change(date(2023, 3, 21), 'Bump support to 10.0.7.', ToppleTheNun),
  change(date(2023, 3, 19), 'Add "Hide Good Casts" toggle to Core Rotation and Cooldown sections of the Guide.', ToppleTheNun),
  change(date(2023, 2, 8), <>Improve <ResourceLink id={RESOURCE_TYPES.FURY.id} /> waste display in Guide.</>, ToppleTheNun),
  change(date(2023, 1, 25), 'Bump support to 10.0.5.', ToppleTheNun),
  change(date(2023, 1, 7), 'Add wasted Fury to Resource Usage section of Guide.', ToppleTheNun),
  change(date(2022, 12, 30), 'Wrap performance box rows in cast breakdowns.', ToppleTheNun),
  change(date(2022, 12, 29), <>Add statistic for damage added by <SpellLink spell={SPELLS.DEMON_SOUL_BUFF_NON_FODDER}/>, <SpellLink spell={SPELLS.DEMON_SOUL_BUFF_FODDER}/>, and Fodder to the Flame.</>, ToppleTheNun),
  change(date(2022, 12, 7), 'Fix cast breakdowns showing "[object Object]" in summary.', ToppleTheNun),
  change(date(2022, 12, 5), 'Make time spent capped on fury more visible.', ToppleTheNun),
  change(date(2022, 12, 5), <>Hide <SpellLink spell={TALENTS.THE_HUNT_TALENT} /> statistic when it hasn't been casted.</>, ToppleTheNun),
  change(date(2022, 12, 4), <>Stop treating <SpellLink spell={SPELLS.THE_HUNT_CHARGE}/> as a castable ability.</>, ToppleTheNun),
  change(date(2022, 11, 26), 'Improve talent checking in checklist.', ToppleTheNun),
  change(date(2022, 11, 21), <>Correctly handle <SpellLink spell={TALENTS.THE_HUNT_TALENT} /> pre-casts.</>, ToppleTheNun),
];
