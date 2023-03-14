import { change, date } from 'common/changelog';
import { Putro, Arlie, ToppleTheNun } from 'CONTRIBUTORS';
import { ResourceLink, SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
export default [
  change(date(2023, 2, 7), <>Fixed an issue with <SpellLink id={TALENTS.DIRE_BEAST_TALENT.id} /> when using a glyph. </>, Putro),
  change(date(2023, 2, 1), <>Fixed an issue with <SpellLink id={SPELLS.BARBED_SHOT_PET_BUFF.id} /> statistic showing too low uptime. </>, Putro),
  change(date(2023, 1, 30), <>Added a <SpellLink id={TALENTS.BARBED_SHOT_TALENT.id}/> usage infographic to the guide.</>, Putro),
  change(date(2023, 1, 30), <>Added a <SpellLink id={SPELLS.BARBED_SHOT_PET_BUFF.id} /> graph to the guide.</>, Putro),
  change(date(2023, 1, 30), <>Added a <ResourceLink id={RESOURCE_TYPES.FOCUS.id}/> usage graph to the guide.</>, Putro),
  change(date(2023, 1, 30), <>Added cooldown efficiency bars for <SpellLink id={TALENTS.BESTIAL_WRATH_TALENT.id}/>, <SpellLink id={TALENTS.DEATH_CHAKRAM_TALENT.id}/>, <SpellLink id={TALENTS.BLOODSHED_TALENT.id} /> and <SpellLink id={TALENTS.DIRE_BEAST_TALENT.id} /> to the guide.</>, Putro),
  change(date(2023, 1, 30), "Started work on a guide section for Beast Mastery.", Putro),
  change(date(2023, 1, 30), <>Reordered <SpellLink id={TALENTS.BARBED_SHOT_TALENT.id} /> events for easier use in the future. </>, Putro),
  change(date(2023, 1, 20), <>Added handling for a large amount of hidden resets on <SpellLink id={TALENTS.KILL_COMMAND_SHARED_TALENT} /> and <SpellLink id={TALENTS.BARBED_SHOT_TALENT} /> to improve cast efficiency metrics.</>, Putro),
  change(date(2023, 1, 20), <>Separated <SpellLink id={SPELLS.DIRE_BEAST_BUFF}/> uptime attribution into <SpellLink id={TALENTS.DIRE_BEAST_TALENT} /> and <SpellLink id={TALENTS.DIRE_PACK_TALENT} />.</>, Putro),
  change(date(2023, 1, 20), <>Updated <SpellLink id={TALENTS.DIRE_BEAST_TALENT}/> base cooldown.</>, Putro),
  change(date(2022, 12, 16), 'Re-enable log parser.', ToppleTheNun),
  change(date(2022, 11, 11), 'Initial transition of Beast Mastery to Dragonflight', [Arlie, Putro]),
];
