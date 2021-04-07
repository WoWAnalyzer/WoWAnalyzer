import { change, date } from 'common/changelog';
import { Kettlepaw, Zeboot, g3neral, Tiboonn, Buudha } from 'CONTRIBUTORS';

export default [
  change(date(2021, 4, 7), 'Correct reporting for Earthwarden absorb events', Kettlepaw),
  change(date(2021, 3, 25), 'Added basic checklist section to be expanded on, and upgraded touched files to Typescript', Buudha),
  change(date(2021, 2, 20), 'Updated the Stats page to use the new Statistics modules', Buudha),
  change(date(2021, 2, 20), 'Added spell info for conduits, Venthyr soulbind\'s and some Kyrain SB\'s as well as legendary data', Buudha),
  change(date(2021, 1, 16), 'Added spell information for conduits', Tiboonn),
  change(date(2020, 12, 21), 'Ironfur GCD and cooldown values', g3neral),
  change(date(2020, 12, 18), 'Fixed compiler errors affecting FrenziedRegen and AntiFillerSpam', Kettlepaw),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
