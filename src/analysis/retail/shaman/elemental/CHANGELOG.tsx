import { change, date } from 'common/changelog';
import TALENTS from 'common/TALENTS/shaman';
import { emallson, Seriousnes, Vollmer } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
  change(date(2025, 10, 15), <>Bump to S3 compatibility</>, Seriousnes),
  change(date(2025, 7, 8), <>Disable <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT} /></>, Seriousnes),
  change(date(2025, 4, 25), <>Fix <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} /> and <SpellLink spell={TALENTS.CALL_OF_THE_ANCESTORS_TALENT} /> timelines, and <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} /> missing from main timeline</>, Seriousnes),
  change(date(2025, 4, 21), <>Update example log.</>, Vollmer),
  change(date(2025, 3, 22), <>Remove "Old Version" view, guide cleanup, fixed <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} /> cooldown analyzer.</>, Seriousnes),
  change(date(2025, 3, 9), <>Fix crash when processing Fusion of Elements data.</>, emallson),
  change(date(2025, 3, 4), <>Elemental Shaman update for TWW S2</>, Seriousnes),
  change(date(2025, 1, 6), <>Fix crash in <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} /> analysis when <SpellLink spell={TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT} /> is used and <SpellLink spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT} /> is not cast.</>, emallson),
  change(date(2024, 11, 17), <>Initial support for 11.0.5</>, Seriousnes),
  change(date(2024, 9, 28), <>Fixed <SpellLink spell={TALENTS.SURGE_OF_POWER_TALENT} /> statistic incorrectly showing as <SpellLink spell={TALENTS.MASTER_OF_THE_ELEMENTS_ELEMENTAL_TALENT} /></>, Seriousnes),
  change(date(2024, 9, 28), <>Updating <SpellLink spell={TALENTS.STORMKEEPER_TALENT} /> analysis</>, Seriousnes),
  change(date(2024, 9, 27), <>Added guide section for <SpellLink spell={TALENTS.PRIMAL_ELEMENTALIST_TALENT} /> usage.</>, Seriousnes),
  change(date(2024, 9, 23), <>Corrected talent link from <i>Heed My Call</i> to <SpellLink spell={TALENTS.ANCIENT_FELLOWSHIP_TALENT}/></>, Seriousnes),
  change(date(2024, 9, 22), <>Added Farseer <SpellLink spell={TALENTS.CALL_OF_THE_ANCESTORS_TALENT} /> analysis.</>, Seriousnes),
  change(date(2024, 9, 17), <>Updated <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> inefficient target count from 3 -&gt; 2</>, Seriousnes),
  change(date(2024, 9, 14), <>Updating <SpellLink spell={TALENTS.STORMKEEPER_TALENT} /> and spender window analysis, added support for <SpellLink spell={TALENTS.FLASH_OF_LIGHTNING_TALENT} /> </>, Seriousnes),
  change(date(2024, 9, 12), <><SpellLink spell={TALENTS.TEMPEST_TALENT} /> now stacks up to 2 times</>, Seriousnes),
  change(date(2024, 9, 3), <>Added hero tab for Stormbringer & <SpellLink spell={TALENTS.TEMPEST_TALENT} /></>, Seriousnes),
  change(date(2024, 7, 26), <>Initial update for The War Within.</>, Seriousnes),
];
