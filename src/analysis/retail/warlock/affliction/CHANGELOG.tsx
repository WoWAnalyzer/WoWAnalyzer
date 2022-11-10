import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import { Dambroda, Sharrq, Maleficien, Akhtal, Pirrang, ToppleTheNun, Jonfanz, Arlie } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';


export default [
  change(date(2022, 11, 10), <>Fix <SpellLink id={TALENTS.DRAIN_SOUL_TALENT.id} /> not showing as intended and add <SpellLink id={SPELLS.IMP_SINGE_MAGIC} />.</>, Arlie),
  change(date(2022, 11, 9), 'Remove Shadowlands covenant abilities from checklist.', ToppleTheNun),
  change(date(2022, 10, 20), <>Fix <SpellLink id={TALENTS.DRAIN_SOUL_TALENT.id} /> damage calculations and add initial support for <SpellLink id={TALENTS.DREAD_TOUCH_TALENT.id} />.</>, Jonfanz),
  change(date(2022, 10, 14), 'Begin working on support for Dragonflight.', Jonfanz),
  change(date(2022, 7, 22), <>Add tracker for number of <SpellLink id={SPELLS.DEMONIC_CIRCLE_SUMMON.id} /> created.</>, ToppleTheNun),
  change(date(2021, 9,  28), <>Updated <SpellLink id={TALENTS.SHADOW_EMBRACE_TALENT.id}/> suggestions and  <SpellLink id={SPELLS.SUMMON_DARKGLARE.id}/> cooldown, </>, Pirrang),
  change(date(2021, 1, 18), <>Added support for <SpellLink id={SPELLS.SCOURING_TITHE.id}/>, <SpellLink id={SPELLS.IMPENDING_CATASTROPHE_CAST.id}/> and <SpellLink id={SPELLS.DECIMATING_BOLT.id}/>.</>, Akhtal),
  change(date(2021, 1, 9), <>Update <SpellLink id={SPELLS.SUMMON_DARKGLARE.id}/> damage calculations to support <SpellLink id={TALENTS.VILE_TAINT_TALENT.id}/>, finish Typescript conversion.</>, Akhtal),
  change(date(2020, 12, 30), <>Add support for <SpellLink id={TALENTS.SHADOW_EMBRACE_TALENT.id}/> and <SpellLink id={TALENTS.HAUNT_TALENT.id}/> in debuff uptime, convert most analyzers to Typescript.</>, Akhtal),
  change(date(2020, 12, 10), 'Updated spells for Shadowlands, added Night Fae spells, fix uptime bug for debuffs cast during pre-pull.', Maleficien),
  change(date(2020, 10, 15), 'Updated Spellbook and added Conduit, Legendary, and Covenant Spell IDs', Sharrq),
  change(date(2020, 10, 15), 'Fixed a crash in prepatch related to Unstable Affliction changes.', Dambroda),
  change(date(2020, 10, 2), 'Deleted Azerite Traits, Updated Statistic Boxes and added Integration Tests.', Sharrq),
];
