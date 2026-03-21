import { change, date } from 'common/changelog';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { Seriousnes } from 'CONTRIBUTORS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceLink from 'interface/ResourceLink';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [  
  change(date(2026, 3, 21), <>Updated <SpellLink spell={TALENTS_SHAMAN.ASCENDANCE_ELEMENTAL_TALENT} /> & <ResourceLink id={RESOURCE_TYPES.MAELSTROM.id} /> Spender guides.</>, Seriousnes),
  change(date(2026, 2, 3), <>Updating <SpellLink spell={TALENTS_SHAMAN.STORMKEEPER_TALENT} /> sources of CDR</>, Seriousnes),
  change(date(2025, 12, 17), <>Updated for Midnight</>, Seriousnes)
];
