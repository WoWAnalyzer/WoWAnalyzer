import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import SpellLink from 'interface/SpellLink';
import { change, date } from 'common/changelog';
import { Thias, Sharrq } from 'CONTRIBUTORS';

const heatShimmer = <SpellLink spell={TALENTS.HEAT_SHIMMER_TALENT} />
const flamestrike = <SpellLink spell={TALENTS.FLAMESTRIKE_1_FIRE_TALENT} />
const heatingUp = <SpellLink spell={SPELLS.HEATING_UP} />
const hotStreak = <SpellLink spell={SPELLS.HOT_STREAK} />
const fireBlast = <SpellLink spell={SPELLS.FIRE_BLAST} />
const combustion = <SpellLink spell={TALENTS.COMBUSTION_TALENT} />
const firedUp = <SpellLink spell={TALENTS.FIRED_UP_1_FIRE_TALENT} />
const meteor = <SpellLink spell={TALENTS.METEOR_TALENT} />
const pyroclasm = <SpellLink spell={TALENTS.PYROCLASM_TALENT} />
const spontaneousCombustion = <SpellLink spell={TALENTS.SPONTANEOUS_COMBUSTION_TALENT} />
const feelTheBurn = <SpellLink spell={TALENTS.FEEL_THE_BURN_TALENT} />
const scorch = <SpellLink spell={SPELLS.SCORCH} />

// prettier-ignore
export default [
  change(date(2026, 4, 26), <>Fixed an issue causing {heatShimmer} to not properly account for buff refreshes.</>, Sharrq),
  change(date(2026, 4, 21), <>Updated Spec Compatability to 12.0.5.</>, Sharrq),
  change(date(2026, 4, 17), <>Temporarily fix crash of {heatShimmer} by extending the buffer</>, Thias),
  change(date(2026, 3, 20), <>Fixed an issue that prevented {flamestrike} from being detected as a {hotStreak} spender if the player chose the talent to cast {flamestrike} at your target instead of your cursor.</>, Sharrq),
  change(date(2026, 3, 20), <>Fixed an issue that caused some {fireBlast} casts to not detect that {combustion} was active.</>, Sharrq),
  change(date(2026, 3, 6), <>Removed Searing Touch and Feel the Burn modules.</>, Sharrq),
  change(date(2026, 3, 6), <>Updated the Fire and Shared Mage Spellbook with the latest cooldown reductions, haste buffs, and cooldowns.</>, Sharrq),
  change(date(2026, 3, 6), <>Added support for {firedUp}.</>, Sharrq),
  change(date(2026, 3, 6), <>Updated {hotStreak}, {heatingUp}, and {combustion }for the latest rotation updates..</>, Sharrq),
  change(date(2026, 3, 6), <>Added support for {meteor}, {heatShimmer}, {pyroclasm}, and {spontaneousCombustion}.</>, Sharrq),
  change(date(2026, 1, 18), <>Set Fire Mage to Maintained and added basic support for Midnight.</>, Sharrq),
  change(date(2026, 1,18), <>Update {hotStreak}, {combustion}, {feelTheBurn}, and {scorch}.</>, Sharrq),
  change(date(2025, 11, 22), <>Enable Fire Mage for Midnight.</>, Sharrq),
];
