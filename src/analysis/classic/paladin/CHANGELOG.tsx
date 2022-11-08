import { change, date } from 'common/changelog';
import { Charurun, Khadaj, Llanas, jazminite } from 'CONTRIBUTORS';

export default [
    change(date(2022, 11, 4), 'Update and re-org Classic Paladin spells.', jazminite),
    change(date(2022, 1, 23), 'Adding Ret Seal of Command Analyzer', Llanas),
    change(date(2021, 10, 28), 'Stubbing out Ret Pally Analyzer', Charurun),
    change(date(2021, 10, 1), 'Stubbing out Holy Pally Analyzer', Khadaj)
];
