import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { emallson, Putro, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

// prettier-ignore
export default [
  change(date(2023, 11, 13), <>Add <strong>Always Be Casting</strong> section to the guide and improve handling of the <strong>Spend Cooldowns</strong> block of the <SpellLink spell={talents.BLACKOUT_COMBO_TALENT}>BoC</SpellLink> rotation.</>, emallson),
  change(date(2023, 11, 13), <>Fix display issues in the <SpellLink spell={talents.IMPROVED_INVOKE_NIUZAO_THE_BLACK_OX_TALENT} /> section.</>, emallson),
  change(date(2023, 10, 22), <>Fix <SpellLink spell={SPELLS.FORTIFYING_BREW_BRM} /> spell id</>, emallson),
  change(date(2023, 9, 10), <>Fix bug in <SpellLink spell={SPELLS.CELESTIAL_FORTUNE_HEAL} /> analysis related to <SpellLink spell={talents.BONEDUST_BREW_TALENT} /> triggers.</>, emallson),
  change(date(2023, 9, 10), <>Added <SpellLink spell={talents.DAMPEN_HARM_TALENT} /> DR % Statistic</>, emallson),
  change(date(2023, 7, 25), <>Update example report to be a 10.1.5 log</>, emallson),
  change(date(2023, 7, 24), <>Update rotational support for 10.1.5</>, emallson),
  change(date(2023, 7, 22), <>Added support for <SpellLink spell={talents.PRESS_THE_ADVANTAGE_TALENT} />.</>, emallson),
  change(date(2023, 7, 3), <>Fixed an issue regarding the cast efficiency of <SpellLink spell={talents.BLACK_OX_BREW_TALENT} />. </>, Putro),
  change(date(2023, 7, 3), <>Move <SpellLink spell={talents.BONEDUST_BREW_TALENT} /> from core rotation to cooldowns section to improve suggestions.</>, emallson),
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2023, 7, 3), <>Fixed handling of pre-pull <SpellLink spell={talents.SUMMON_WHITE_TIGER_STATUE_TALENT} /> casts.</>, emallson),
  change(date(2023, 7, 3), <>Added statistics for <SpellLink spell={talents.QUICK_SIP_TALENT} />, <SpellLink spell={talents.STAGGERING_STRIKES_TALENT} />, and <SpellLink spell={talents.TRANQUIL_SPIRIT_TALENT} />.</>, emallson),
  change(date(2023, 6, 25), <>Fixed <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} /> buff checking in rotational tools.</>, emallson),
  change(date(2023, 6, 3), <>Fixed <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> cast efficiency when using <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} />.</>, emallson),
  change(date(2023, 6, 3), <>Added basic <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> section.</>, emallson),
  change(date(2023, 6, 3), <>Update rotation for patch 10.1.</>, emallson),
  change(date(2023, 3, 21), <>Marked as supported in patch 10.0.7.</>, emallson),
  change(date(2023, 3, 19), <>Improved Shuffle & Damage Taken displays on Raszageth.</>, emallson),
  change(date(2023, 3, 12), <>Update APL to handle <SpellLink spell={talents.EXPLODING_KEG_TALENT} /> tech and add basic major cooldown list.</>, emallson),
  change(date(2023, 1, 30), <>Fix calculation of haste bonus from <SpellLink spell={talents.HIGH_TOLERANCE_TALENT} /></>, emallson),
  change(date(2023, 1, 30), <>Support T29 buff to <SpellLink spell={talents.PURIFYING_BREW_TALENT} /></>, emallson),
  change(date(2023, 1, 21), <>Update <SpellLink spell={talents.CELESTIAL_BREW_TALENT} /> and <SpellLink spell={SPELLS.STAGGER} /> for the recent hotfix buffs.</>, emallson),
  change(date(2023, 1, 14), <>Don't count repeated <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> applications as wasted when using <SpellLink spell={talents.SHADOWBOXING_TREADS_BREWMASTER_TALENT} />.</>, emallson),
  change(date(2022, 12, 16), <>Improve labeling of points on <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> chart.</>, emallson),
  change(date(2022, 12, 14), <>Updated Example Report on home page.</>, emallson),
  change(date(2022, 12, 14), <>Updated <strong>Core Rotation</strong> section to match latest updates to our rotation.</>, emallson),
  change(date(2022, 12, 12), <>Added <em>internal</em> support for many cooldown reduction talents (like <SpellLink spell={talents.ANVIL__STAVE_TALENT} />, <SpellLink spell={talents.FACE_PALM_TALENT} />, and <SpellLink spell={talents.CHI_SURGE_TALENT} />)</>, emallson),
  change(date(2022, 12, 12), <>Added <em>internal</em> support for <SpellLink spell={SPELLS.STAGGER} />-reducing talents (<SpellLink spell={talents.QUICK_SIP_TALENT} />, <SpellLink spell={talents.STAGGERING_STRIKES_TALENT} />, and <SpellLink spell={talents.TRANQUIL_SPIRIT_TALENT} />). This ensures that Stagger tracking is correct across the spec. Statistics will be displayed in the future.</>, emallson),
  change(date(2022, 12, 9), <>Added analysis of major defensive cooldowns.</>, emallson),
  change(date(2022, 10, 22), <><SpellLink spell={talents.SHUFFLE_TALENT} /> section update, plus miscellaneous Dragonflight cleanup.</>, emallson),
  change(date(2022, 9, 27), <>Add Rotation section to the new summary page.</>, emallson),
  change(date(2022, 7, 10), <>Improve display of <SpellLink spell={talents.PURIFYING_BREW_TALENT} /> in guide and add warning about <code>/sit</code> use with <SpellLink spell={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT} />.</>, emallson),
  change(date(2022, 6, 28), <>Squash a couple of bugs in the new overview page.</>, emallson),
  change(date(2022, 6, 27), <>Added prototype "guide"-style overview page.</>, emallson),
];
