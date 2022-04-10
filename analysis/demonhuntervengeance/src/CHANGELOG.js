
import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Adoraci, Yajinni, Zeboot, LeoZhekov, TurianSniper, Geeii, Makhai, Yax, emallson, xepheris } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 4, 7), <>Added Average <SpellLink id={SPELLS.BLIND_FAITH_BUFF.id} /> versatility buff stat tracking.</>, xepheris),
  change(date(2022, 3, 26), 'Fix crash related to Unity legendary support.', emallson),
  change(date(2021, 10, 15), <>Added <SpellLink id={SPELLS.FIERY_SOUL.id} /> support.</>, Yax),
  change(date(2021, 10, 15), <>Fixed Fury Usage costs.</>, Yax),
  change(date(2021, 4, 4), <>Added <SpellLink id={SPELLS.FEL_DEFENDER.id} /> conduit support.</>, Adoraci),
  change(date(2021, 4, 3), 'Verified 9.0.5 patch changes and bumped support to 9.0.5', Adoraci),
  change(date(2021, 1, 20), <> Added <SpellLink id={SPELLS.ELYSIAN_DECREE.id} />  <SpellLink id={SPELLS.SINFUL_BRAND.id} /> and <SpellLink id={SPELLS.THE_HUNT.id}/> to Statistics</>, Makhai),
  change(date(2021, 1, 10), <> Added tracking of wasted soul generation by <SpellLink id={SPELLS.FRACTURE_TALENT.id} /> / <SpellLink id={SPELLS.SHEAR.id} />. Added to suggestions and checklist. </>, Yajinni),
  change(date(2021, 1, 10), <> Updated <SpellLink id={SPELLS.ELYSIAN_DECREE.id} /> to take into accoun the conduit <SpellLink id={SPELLS.REPEAT_DECREE.id} />.</>, Yajinni),
  change(date(2020, 12, 28), 'Updated Demonic Spikes, implemented Infernal Strikes (but disabling due to blizzard bug)', Geeii),
  change(date(2020, 12, 27), 'Updated to use Fury resource, instead of outdated Pain. Updated Soul Cleave reporting, updated ability tracking for Sigil of Flame for some cases', Geeii),
  change(date(2020, 12, 27), 'Initial SL update for talent changes and covenant abilities', TurianSniper),
  change(date(2020, 10, 30), 'Replaced the deprecated StatisticBox with the new Statistic', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
