import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { emallson } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2023, 6, 25), <>Fixed <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} /> buff checking in rotational tools.</>, emallson),
  change(date(2023, 6, 3), <>Fixed <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> cast efficiency when using <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} />.</>, emallson),
  change(date(2023, 6, 3), <>Added basic <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> section.</>, emallson),
  change(date(2023, 6, 3), <>Update rotation for patch 10.1.</>, emallson),
  change(date(2023, 3, 21), <>Marked as supported in patch 10.0.7.</>, emallson),
  change(date(2023, 3, 19), <>Improved Shuffle & Damage Taken displays on Raszageth.</>, emallson),
  change(date(2023, 3, 12), <>Update APL to handle <SpellLink id={talents.EXPLODING_KEG_TALENT} /> tech and add basic major cooldown list.</>, emallson),
  change(date(2023, 1, 30), <>Fix calculation of haste bonus from <SpellLink id={talents.HIGH_TOLERANCE_TALENT} /></>, emallson),
  change(date(2023, 1, 30), <>Support T29 buff to <SpellLink id={talents.PURIFYING_BREW_TALENT} /></>, emallson),
  change(date(2023, 1, 21), <>Update <SpellLink id={talents.CELESTIAL_BREW_TALENT} /> and <SpellLink id={SPELLS.STAGGER} /> for the recent hotfix buffs.</>, emallson),
  change(date(2023, 1, 14), <>Don't count repeated <SpellLink id={talents.BLACKOUT_COMBO_TALENT} /> applications as wasted when using <SpellLink id={talents.SHADOWBOXING_TREADS_BREWMASTER_TALENT} />.</>, emallson),
  change(date(2022, 12, 16), <>Improve labeling of points on <SpellLink id={talents.PURIFYING_BREW_TALENT} /> chart.</>, emallson),
  change(date(2022, 12, 14), <>Updated Example Report on home page.</>, emallson),
  change(date(2022, 12, 14), <>Updated <strong>Core Rotation</strong> section to match latest updates to our rotation.</>, emallson),
  change(date(2022, 12, 12), <>Added <em>internal</em> support for many cooldown reduction talents (like <SpellLink id={talents.ANVIL__STAVE_TALENT} />, <SpellLink id={talents.FACE_PALM_TALENT} />, and <SpellLink id={talents.CHI_SURGE_TALENT} />)</>, emallson),
  change(date(2022, 12, 12), <>Added <em>internal</em> support for <SpellLink id={SPELLS.STAGGER} />-reducing talents (<SpellLink id={talents.QUICK_SIP_TALENT} />, <SpellLink id={talents.STAGGERING_STRIKES_TALENT} />, and <SpellLink id={talents.TRANQUIL_SPIRIT_TALENT} />). This ensures that Stagger tracking is correct across the spec. Statistics will be displayed in the future.</>, emallson),
  change(date(2022, 12, 9), <>Added analysis of major defensive cooldowns.</>, emallson),
  change(date(2022, 10, 22), <><SpellLink id={talents.SHUFFLE_TALENT} /> section update, plus miscellaneous Dragonflight cleanup.</>, emallson),
  change(date(2022, 9, 27), <>Add Rotation section to the new summary page.</>, emallson),
  change(date(2022, 7, 10), <>Improve display of <SpellLink id={talents.PURIFYING_BREW_TALENT.id} /> in guide and add warning about <code>/sit</code> use with <SpellLink id={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id} />.</>, emallson),
  change(date(2022, 6, 28), <>Squash a couple of bugs in the new overview page.</>, emallson),
  change(date(2022, 6, 27), <>Added prototype "guide"-style overview page.</>, emallson),
];
