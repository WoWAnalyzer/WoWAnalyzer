import { change, date } from 'common/changelog';
import talents from 'common/TALENTS/monk';
import { emallson } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2023, 1, 14), <>Don't count repeated <SpellLink id={talents.BLACKOUT_COMBO_TALENT} /> applications as wasted when using <SpellLink id={talents.SHADOWBOXING_TREADS_BREWMASTER_TALENT} />.</>, emallson),
  change(date(2022, 12, 16), <>Improve labeling of points on <SpellLink id={talents.PURIFYING_BREW_TALENT} /> chart.</>, emallson),
  change(date(2022, 12, 14), <>Updated Example Report on home page.</>, emallson),
  change(date(2022, 12, 14), <>Updated <strong>Core Rotation</strong> section to match latest updates to our rotation.</>, emallson),
  change(date(2022, 12, 12), <>Added <em>internal</em> support for many cooldown reduction talents (like <SpellLink id={talents.ANVIL__STAVE_TALENT} />, <SpellLink id={talents.FACE_PALM_TALENT} />, and <SpellLink id={talents.CHI_SURGE_TALENT} />)</>, emallson),
  change(date(2022, 12, 12), <>Added <em>internal</em> support for <SpellLink id={talents.STAGGER_TALENT} />-reducing talents (<SpellLink id={talents.QUICK_SIP_TALENT} />, <SpellLink id={talents.STAGGERING_STRIKES_TALENT} />, and <SpellLink id={talents.TRANQUIL_SPIRIT_TALENT} />). This ensures that Stagger tracking is correct across the spec. Statistics will be displayed in the future.</>, emallson),
  change(date(2022, 12, 9), <>Added analysis of major defensive cooldowns.</>, emallson),
  change(date(2022, 10, 22), <><SpellLink id={talents.SHUFFLE_TALENT} /> section update, plus miscellaneous Dragonflight cleanup.</>, emallson),
  change(date(2022, 9, 27), <>Add Rotation section to the new summary page.</>, emallson),
  change(date(2022, 7, 10), <>Improve display of <SpellLink id={talents.PURIFYING_BREW_TALENT.id} /> in guide and add warning about <code>/sit</code> use with <SpellLink id={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id} />.</>, emallson),
  change(date(2022, 6, 28), <>Squash a couple of bugs in the new overview page.</>, emallson),
  change(date(2022, 6, 27), <>Added prototype "guide"-style overview page.</>, emallson),
];
