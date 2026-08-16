import { change, date } from 'common/changelog';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { Seriousnes } from 'CONTRIBUTORS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2026, 6, 19), <>Added Midnight Season 2 tier set analysis and a <SpellLink spell={TALENTS_SHAMAN.POWER_OF_THE_MAELSTROM_TALENT} /> module.</>, Seriousnes),
  change(date(2026, 5, 23), <>Internal cleanup: consolidated shared talents, removed dead modules, and aligned with framework conventions.</>, Seriousnes),
  change(date(2026, 4, 24), <>Updated for 12.0.5 compatibility.</>, Seriousnes),
  change(date(2026, 3, 26), <>Fixed <SpellLink spell={TALENTS_SHAMAN.MASTER_OF_THE_ELEMENTS_TALENT} /> buff ordering, updated performance calculations for <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> spender guide.</>, Seriousnes),
  change(date(2026, 3, 21), <>Updated <SpellLink spell={TALENTS_SHAMAN.ASCENDANCE_ELEMENTAL_TALENT} /> & <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> Spender guides.</>, Seriousnes),
  change(date(2026, 2, 3), <>Updating <SpellLink spell={TALENTS_SHAMAN.STORMKEEPER_TALENT} /> sources of CDR</>, Seriousnes),
  change(date(2025, 12, 17), <>Updated for Midnight</>, Seriousnes)
];
