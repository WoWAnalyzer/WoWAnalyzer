import { change, date } from 'common/changelog';
import { Vollmer } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import TALENTS from 'common/TALENTS/evoker';

export default [
    change(date(2023, 7, 20), <>Add <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> to Cooldown Graph.</>, Vollmer),
    change(date(2023, 7, 20), <>Add support for pre-pull casts of <SpellLink spell={TALENTS.PRESCIENCE_TALENT} /> and <SpellLink spell={TALENTS.EBON_MIGHT_TALENT} />.</>, Vollmer),
    change(date(2023, 7, 19), <>Initial implementation of Augmentation</>, Vollmer),
];
