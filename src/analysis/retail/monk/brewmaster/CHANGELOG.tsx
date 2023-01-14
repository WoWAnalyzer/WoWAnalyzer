import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import {
  Abelito75,
  emallson,
  Dambroda,
  Zeboot,
  LeoZhekov,
  Matardarix,
  nullDozzer,
  Hordehobbs,
  Akhtal,
  carglass,
  kate,
} from 'CONTRIBUTORS';
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
  change(date(2022, 6, 6), <>Fixed tracking of <SpellLink id={SPELLS.SCALDING_BREW.id} /> damage</>, nullDozzer),
  change(date(2022, 5, 3), <>Added a Dampen Harm stat. </>, kate),
  change(date(2022, 5, 1), <>Add <SpellLink id={SPELLS.INVOKERS_DELIGHT_BUFF.id} /> to timeline. </>, nullDozzer),
  change(date(2022, 4, 16), <>Added a Mystic Touch stat. </>, Abelito75),
  change(date(2022, 3, 23), <>Fix <SpellLink id={SPELLS.STAGGER.id} /> chart that was broken by version bump.</>, emallson),
  change(date(2022, 2, 5), <>Improve APL handling with multiple charges of <SpellLink id={talents.KEG_SMASH_TALENT.id} /></>, emallson),
  change(date(2021, 11, 6), <>Add AoE condition for <SpellLink id={SPELLS.SPINNING_CRANE_KICK_BRM.id} /> to APL.</>, emallson),
  change(date(2021, 10, 28), <>Bump supported version to 9.1.5.</>, emallson),
  change(date(2021, 10, 16), <>Added APL support.</>, emallson),
  change(
    date(2021, 5, 23),
    <>
      Reworked <SpellLink id={SPELLS.EXPEL_HARM.id}>Expel Harm</SpellLink> Normalizer to support
      attracted <SpellLink id={SPELLS.GIFT_OF_THE_OX_1.id}>Gift of the Ox Orbs</SpellLink>{' '}
    </>,
    carglass,
  ),
  change(
    date(2021, 3, 12),
    <>
      Adjusted suggestion threshold for <SpellLink id={talents.CELESTIAL_BREW_TALENT.id} /> cast efficiency.
    </>,
    emallson,
  ),
  change(
    date(2021, 2, 23),
    <>
      Added <SpellLink id={SPELLS.CELESTIAL_EFFERVESCENCE.id} /> statistic module.
    </>,
    Matardarix,
  ),
  change(
    date(2021, 1, 28),
    <>
      Added <SpellLink id={SPELLS.WALK_WITH_THE_OX.id} /> statistic module.
    </>,
    Matardarix,
  ),
  change(
    date(2021, 1, 25),
    <>
      Add support for <SpellLink id={SPELLS.FORTIFYING_INGREDIENTS.id} />,{' '}
      <SpellLink id={SPELLS.GROUNDING_BREATH.id} /> and <SpellLink id={SPELLS.HARM_DENIAL.id} />.
    </>,
    Matardarix,
  ),
  change(
    date(2021, 1, 23),
    <>
      Add wasted cooldown avoided to <SpellLink id={talents.STORMSTOUTS_LAST_KEG_TALENT.id} /> statistic
      tooltip.
    </>,
    emallson,
  ),
  change(
    date(2021, 1, 18),
    <>
      Add support for <SpellLink id={talents.STORMSTOUTS_LAST_KEG_TALENT.id} />.
    </>,
    Matardarix,
  ),
  change(
    date(2021, 1, 16),
    <>
      Added <SpellLink id={SPELLS.WALK_WITH_THE_OX.id} /> cooldown reduction.
    </>,
    emallson,
  ),
  change(
    date(2021, 1, 16),
    <>
      Added <SpellLink id={SPELLS.WEAPONS_OF_ORDER_CAST.id} />,{' '}
      <SpellLink id={SPELLS.BONEDUST_BREW_CAST.id} /> and{' '}
      <SpellLink id={SPELLS.FAELINE_STOMP_CAST.id} /> to Brewmaster ability list.
    </>,
    emallson,
  ),
  change(
    date(2020, 12, 28),
    <>
      Bug fixes for <SpellLink id={talents.BLACK_OX_BREW_TALENT.id} />.{' '}
    </>,
    Akhtal,
  ),
  change(
    date(2020, 12, 28),
    <>
      Add support for <SpellLink id={talents.CHI_BURST_TALENT.id} /> and{' '}
      <SpellLink id={talents.CHI_WAVE_TALENT.id} />.{' '}
    </>,
    Akhtal,
  ),
  change(
    date(2020, 12, 28),
    <>
      Add fix for non-enemy targets hit by <SpellLink id={SPELLS.SCALDING_BREW.id} />.{' '}
    </>,
    Hordehobbs,
  ),
  change(
    date(2020, 12, 10),
    <>
      Added stats for <SpellLink id={SPELLS.SCALDING_BREW.id} /> and{' '}
      <SpellLink id={SPELLS.EVASIVE_STRIDE.id} />.
    </>,
    emallson,
  ),
  change(
    date(2020, 12, 15),
    <>
      Fix <SpellLink id={talents.LIGHT_BREWING_TALENT.id} /> ID
    </>,
    Matardarix,
  ),
  change(
    date(2020, 11, 26),
    <>Replaced the deprecated StatisticBoxes from the modules with the new Statistic</>,
    LeoZhekov,
  ),
  change(
    date(2020, 10, 24),
    <>
      Added checklist item and timeline annotations for bad <SpellLink id={SPELLS.TIGER_PALM.id} />{' '}
      casts.
    </>,
    emallson,
  ),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(
    date(2020, 10, 17),
    'Added some missing abilities and updated ability cooldowns.',
    Dambroda,
  ),
  change(
    date(2020, 10, 16),
    <>
      Removed "Inefficient <SpellLink id={talents.PURIFYING_BREW_TALENT.id} /> Casts" statistic.
    </>,
    emallson,
  ),
  change(date(2020, 10, 12), 'Updated checklist to reflect the Shadowlands changes.', emallson),
  change(date(2020, 10, 6), <>Added Fallen Order statistic.</>, Abelito75),
  change(date(2020, 9, 5), <>Updated Brewmaster spells for Shadowlands.</>, emallson),
];
