import { change, date } from 'common/changelog';
import { Putro, Arlie, ToppleTheNun, SebShady } from 'CONTRIBUTORS';
import { ResourceLink, SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
export default [
  change(date(2024, 9, 27), <>Initial TWW compability update as of 11.0.2 patch. </>, SebShady),
  change(date(2024, 2, 15), <>Try to workaround weird buff events on bosses like Volcoross for <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> </>, Putro),
  change(date(2023, 11, 21), <>Update when <SpellLink spell={TALENTS.BARBED_SHOT_TALENT}  /> are marked as good or bad casts. </>, Putro),
  change(date(2023, 11, 21), <>Add <SpellLink spell={TALENTS.CALL_OF_THE_WILD_TALENT} /> to the spellbook specifying cooldown and global cooldown. </>, Putro),
  change(date(2023, 10, 18), <>Enable spec with 10.2 changes</>,Arlie),
  change(date(2023, 10, 3), <>Add Steel Trap as a trackable talent. </>, Putro),
  change(date(2023, 7, 29), 'Mark Beast Mastery as compatible for 10.1.5', Putro),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 7, 3), 'Added support for Tier 30 2piece and 4piece', Putro),
  change(date(2023, 5, 8), <>Fixed an issue with <SpellLink spell={TALENTS.BLOODSHED_TALENT} />. </>, Putro),
  change(date(2023, 5, 8), <>Added support for T29 tier sets.</>, Putro),
  change(date(2023, 5, 8), <>Fixed another issue with <SpellLink spell={TALENTS.DIRE_BEAST_TALENT} /> when using a glyph. </>, Putro),
  change(date(2023, 4, 7), 'Mark Beast Mastery as compatible for 10.0.7', Putro),
  change(date(2023, 2, 7), <>Fixed an issue with <SpellLink spell={TALENTS.DIRE_BEAST_TALENT} /> when using a glyph. </>, Putro),
  change(date(2023, 2, 1), <>Fixed an issue with <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> statistic showing too low uptime. </>, Putro),
  change(date(2023, 1, 30), <>Added a <SpellLink spell={TALENTS.BARBED_SHOT_TALENT}/> usage infographic to the guide.</>, Putro),
  change(date(2023, 1, 30), <>Added a <SpellLink spell={SPELLS.BARBED_SHOT_PET_BUFF} /> graph to the guide.</>, Putro),
  change(date(2023, 1, 30), <>Added a <ResourceLink id={RESOURCE_TYPES.FOCUS.id}/> usage graph to the guide.</>, Putro),
  change(date(2023, 1, 30), <>Added cooldown efficiency bars for <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT}/>, <SpellLink spell={TALENTS.BLOODSHED_TALENT} /> and <SpellLink spell={TALENTS.DIRE_BEAST_TALENT} /> to the guide.</>, Putro),
  change(date(2023, 1, 30), "Started work on a guide section for Beast Mastery.", Putro),
  change(date(2023, 1, 30), <>Reordered <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> events for easier use in the future. </>, Putro),
  change(date(2023, 1, 20), <>Added handling for a large amount of hidden resets on <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> and <SpellLink spell={TALENTS.BARBED_SHOT_TALENT} /> to improve cast efficiency metrics.</>, Putro),
  change(date(2023, 1, 20), <>Separated <SpellLink spell={SPELLS.DIRE_BEAST_BUFF}/> uptime attribution into <SpellLink spell={TALENTS.DIRE_BEAST_TALENT} /> and Dire Pack.</>, Putro),
  change(date(2023, 1, 20), <>Updated <SpellLink spell={TALENTS.DIRE_BEAST_TALENT}/> base cooldown.</>, Putro),
  change(date(2022, 12, 16), 'Re-enable log parser.', ToppleTheNun),
  change(date(2022, 11, 11), 'Initial transition of Beast Mastery to Dragonflight', [Arlie, Putro]),
];
