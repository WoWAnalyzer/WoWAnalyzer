import { change, date } from 'common/changelog';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { Seriousnes, Texleretour } from 'CONTRIBUTORS';
import SpellLink from 'interface/SpellLink';

// prettier-ignore
export default [
    change(date(2026, 8, 27), <>Guide fixes: <SpellLink spell={TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT} /> window source correctly identified as proc or cast, <SpellLink spell={TALENTS_SHAMAN.VOLTAIC_BLAZE_TALENT} /> no longer counts as a missed cast during <SpellLink spell={TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT} /> and <SpellLink spell={TALENTS_SHAMAN.HOT_HAND_TALENT} />.</>, Seriousnes),
    change(date(2026, 8, 27), <>Added Midnight Season 2 tier set guide section tracking delayed <SpellLink spell={TALENTS_SHAMAN.VOLTAIC_BLAZE_TALENT} /> and <SpellLink spell={TALENTS_SHAMAN.CRASH_LIGHTNING_TALENT} /> casts, and <SpellLink spell={TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT} /> hold time per <SpellLink spell={TALENTS_SHAMAN.DOOM_WINDS_TALENT} /> window.</>, Seriousnes),
    change(date(2026, 6, 19), <>Added Midnight Season 2 tier set analysis, with <SpellLink spell={TALENTS_SHAMAN.VOLTAIC_BLAZE_TALENT} /> and <SpellLink spell={TALENTS_SHAMAN.CRASH_LIGHTNING_TALENT} /> modules.</>, Seriousnes),
    change(date(2026, 6, 11), <>Updates for <SpellLink spell={TALENTS_SHAMAN.TEMPEST_TALENT} /> and <SpellLink spell={TALENTS_SHAMAN.SURGING_TOTEM_TALENT} /> analysis.</>, Seriousnes),
    change(date(2026, 5, 25), <>Added Hero Talent guide section with <SpellLink spell={TALENTS_SHAMAN.TEMPEST_TALENT} /> and <SpellLink spell={TALENTS_SHAMAN.SURGING_TOTEM_TALENT} /> modules.</>, Seriousnes),
    change(date(2026, 5, 23), <>Internal cleanup: fixed stale module keys, removed dead modules, and aligned with framework conventions.</>, Seriousnes),
    change(date(2026, 4, 24), <>Updated for 12.0.5 compatibility.</>, Seriousnes),
    change(date(2026, 3, 26), <>Reordered guide, updated performance calculations for <SpellLink spell={TALENTS_SHAMAN.HOT_HAND_TALENT} />.</>, Seriousnes),
    change(date(2026, 3, 19), <>Further updates to Enhancement Guides.</>, Seriousnes),
    change(date(2026, 3, 15), <>Updated guide for <SpellLink spell={TALENTS_SHAMAN.PRIMORDIAL_STORM_TALENT} />, <SpellLink spell={TALENTS_SHAMAN.HOT_HAND_TALENT} />, and <SpellLink spell={TALENTS_SHAMAN.DOOM_WINDS_TALENT} />.</>, Seriousnes),
    change(date(2026, 2, 12), <>Fix typos and talent check issues.</>, Texleretour),
    change(date(2025, 12, 17), <>Updated for Midnight</>, Seriousnes)
];
