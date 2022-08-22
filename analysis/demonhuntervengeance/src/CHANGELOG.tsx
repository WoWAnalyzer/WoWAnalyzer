import { change, date } from 'common/changelog';
import DH_SPELLS from 'common/SPELLS/demonhunter';
import DH_CONDUITS from 'common/SPELLS/shadowlands/conduits/demonhunter';
import DH_COVENANTS from 'common/SPELLS/shadowlands/covenants/demonhunter';
import DH_LEGENDARIES from 'common/SPELLS/shadowlands/legendaries/demonhunter';
import DH_TALENTS from 'common/SPELLS/talents/demonhunter';
import { Adoraci, emallson, Geeii, LeoZhekov, Makhai, ToppleTheNun, TurianSniper, xepheris, Yajinni, Yax, Zeboot } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2022, 8, 22), 'Migrate to class/spec specific spell setup.', ToppleTheNun),
  change(date(2022, 8, 12), <>Add support for <SpellLink id={DH_COVENANTS.FODDER_TO_THE_FLAME_DAMAGE.id} />.</>, ToppleTheNun),
  change(date(2022, 7, 24), <>Correct <SpellLink id={DH_COVENANTS.SINFUL_BRAND.id} /> cooldown.</>, ToppleTheNun),
  change(date(2022, 4, 7), <>Added several conduits and updated <SpellLink id={DH_TALENTS.AGONIZING_FLAMES_TALENT.id} /> implementation.</>, xepheris),
  change(date(2022, 4, 7), <>Added Average <SpellLink id={DH_COVENANTS.BLIND_FAITH_BUFF.id} /> versatility buff stat tracking.</>, xepheris),
  change(date(2022, 3, 26), 'Fix crash related to Unity legendary support.', emallson),
  change(date(2021, 10, 15), <>Added <SpellLink id={DH_LEGENDARIES.FIERY_SOUL.id} /> support.</>, Yax),
  change(date(2021, 10, 15), <>Fixed Fury Usage costs.</>, Yax),
  change(date(2021, 4, 4), <>Added <SpellLink id={DH_CONDUITS.FEL_DEFENDER.id} /> conduit support.</>, Adoraci),
  change(date(2021, 4, 3), 'Verified 9.0.5 patch changes and bumped support to 9.0.5', Adoraci),
  change(date(2021, 1, 20), <>Added <SpellLink id={DH_COVENANTS.ELYSIAN_DECREE.id} /> <SpellLink id={DH_COVENANTS.SINFUL_BRAND.id} /> and <SpellLink id={DH_COVENANTS.THE_HUNT.id} /> to Statistics</>, Makhai),
  change(date(2021, 1, 10), <>Added tracking of wasted soul generation by <SpellLink id={DH_TALENTS.FRACTURE_TALENT.id} /> / <SpellLink id={DH_SPELLS.SHEAR.id} />. Added to suggestions and checklist.</>, Yajinni),
  change(date(2021, 1, 10), <>Updated <SpellLink id={DH_COVENANTS.ELYSIAN_DECREE.id} /> to take into accoun the conduit <SpellLink id={DH_CONDUITS.REPEAT_DECREE.id} />.</>, Yajinni),
  change(date(2020, 12, 28), 'Updated Demonic Spikes, implemented Infernal Strikes (but disabling due to blizzard bug)', Geeii),
  change(date(2020, 12, 27), 'Updated to use Fury resource, instead of outdated Pain. Updated Soul Cleave reporting, updated ability tracking for Sigil of Flame for some cases', Geeii),
  change(date(2020, 12, 27), 'Initial SL update for talent changes and covenant abilities', TurianSniper),
  change(date(2020, 10, 30), 'Replaced the deprecated StatisticBox with the new Statistic', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
