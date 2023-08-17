import { change, date } from 'common/changelog';
import { Vollmer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';

export default [
    change(date(2023, 8, 17), <>Add statistics for <SpellLink spell={TALENTS.PUPIL_OF_ALEXSTRASZA_TALENT} />.</>, Vollmer),
    change(date(2023, 8, 17), <>Add statistics for <SpellLink spell={TALENTS.ANACHRONISM_TALENT} />.</>, Vollmer),
    change(date(2023, 8, 17), <>Fixed edgecase for <SpellLink spell={SPELLS.SANDS_OF_TIME} /> where <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> should have extended but didn't.</>, Vollmer),
    change(date(2023, 8, 14), <>Fixed issue when <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> wasn't used.</>, Vollmer),
    change(date(2023, 8, 10), <>Normalize pre-pull <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> usage.</>, Vollmer),
    change(date(2023, 8, 1), <>Add missing trinkets to timeline.</>, Vollmer),
    change(date(2023, 8, 1), <>Implement <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> module.</>, Vollmer),
    change(date(2023, 8, 1), <>Fix edgecase for <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> being removed and re-applied instead of refreshed.</>, Vollmer),
    change(date(2023, 7, 25), <>Fix another edgecase with <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> being applied twice.</>, Vollmer),
    change(date(2023, 7, 22), <>Add <SpellLink spell={TALENTS.TIME_SKIP_TALENT} /> to channeled spells to fix downtime and timeline.</>, Vollmer),
    change(date(2023, 7, 22), <>Update performance check for <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} />, <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> and <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} /> .</>, Vollmer),
    change(date(2023, 7, 22), <>Fix <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} /> sometimes being applied twice.</>, Vollmer),
    change(date(2023, 7, 22), <>Fix edgecase for pre-pull cast of <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> not being properly found.</>, Vollmer),
    change(date(2023, 7, 20), <>Add <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> to Cooldown Graph.</>, Vollmer),
    change(date(2023, 7, 20), <>Add support for pre-pull casts of <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> and <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} />.</>, Vollmer),
    change(date(2023, 7, 19), <>Initial implementation of Augmentation</>, Vollmer),
];
