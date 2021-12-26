import { change, date } from 'common/changelog';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { Adoraci, Putro, Zeboot, Kartarn } from 'CONTRIBUTORS';
import { ItemLink, SpellLink } from 'interface';

export default [
  change(date(2021, 12, 12), <> Updated the APL Checker to also enforce recommend early refreshes of <SpellLink id={SPELLS.STEADY_FOCUS_TALENT.id} /> if your last cast was <SpellLink id={SPELLS.STEADY_SHOT.id}/>. </> , Putro),
  change(date(2021, 12, 12), <> Added <SpellLink id={SPELLS.WILD_SPIRITS_BUFF.id} />, <SpellLink id={SPELLS.RESONATING_ARROW_DAMAGE_AND_BUFF.id}/> and <SpellLink id={SPELLS.FLAYERS_MARK.id} /> to the timeline to better show when these covenant specifics buffs were active.</>, Putro),
  change(date(2021, 11, 13), 'Implemented an initial version of the APL checker module.', Putro),
  change(date(2021, 11, 11), <> Added a simple analyzer to track damage gained from <SpellLink id={SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS.id}/>. </>, Putro),
  change(date(2021, 11, 5), <> Correct an issue where the increased damage attributed to <SpellLink id={SPELLS.BRUTAL_PROJECTILES_CONDUIT.id}/> was ramping up too fast. </>, Putro),
  change(date(2021, 11, 5), <> Added support for <SpellLink id={SPELLS.WAILING_ARROW_CAST.id}/> as provided by <ItemLink id={ITEMS.RAESHALARE_DEATHS_WHISPER.id} />. </>, Putro),
  change(date(2021, 10, 31), <> Fix a bug with <SpellLink id={SPELLS.CAREFUL_AIM_TALENT.id}/> that showed it's contribution as much larger than it actually was. </>, Putro),
  change(date(2021, 4, 3), <>Update <SpellLink id={SPELLS.EAGLETALONS_TRUE_FOCUS_EFFECT.id} /> and other legendaries to 9.0.5. Bump support to 9.0.5.</>, Adoraci),
  change(date(2021, 3, 6), 'Fixed suggestion for wasted regenerated focus.', Kartarn),
  change(date(2021, 1, 16), 'Due to the paywalling of the timeline feature, and fundamental differences of opinion - I will no longer be updating this module beyond todays date. All the modules should be accurate for Castle Nathria, but will not be accurate going forward.', Putro),
  change(date(2021, 1, 16), <> Added support for <SpellLink id={SPELLS.REVERSAL_OF_FORTUNE_CONDUIT.id} />, <SpellLink id={SPELLS.REJUVENATING_WIND_CONDUIT.id} /> and <SpellLink id={SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id} />. </>, Putro),
  change(date(2021, 1, 10), <> Create a hacky solution to handle precasting <SpellLink id={SPELLS.AIMED_SHOT.id} /> to properly handle downtime - this leads to showing extremely short casttime for any precast Aimed Shot that finishes cast inside combat.</>, Putro),
  change(date(2021, 1, 10), <> Adjusted <SpellLink id={SPELLS.WILD_SPIRITS.id} /> global cooldown to correctly be reduced by haste twice in the analyzer, to reflect behaviour in-game. </>, Putro),
  change(date(2021, 1, 8), <> Correct an issue where if <SpellLink id={SPELLS.HUNTERS_MARK.id} /> was applied before combat and never dropped, <SpellLink id={SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id} /> would never be attributed any damage. </>, Putro),
  change(date(2021, 1, 3), <> Added support for <SpellLink id={SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id} /> and <SpellLink id={SPELLS.RESILIENCE_OF_THE_HUNTER_CONDUIT.id} />. </>, Putro),
  change(date(2020, 12, 20), <> Added proper handling for registering prepull casts of <SpellLink id={SPELLS.DOUBLE_TAP_TALENT.id} />. </>, Putro),
  change(date(2020, 12, 19), <> Added a usage requirement to <SpellLink id={SPELLS.FLARE.id} /> and <SpellLink id={SPELLS.TAR_TRAP.id} /> when using <SpellLink id={SPELLS.SOULFORGE_EMBERS_EFFECT.id} /> </>, Putro),
  change(date(2020, 12, 19), <> Fixed an issue where <SpellLink id={SPELLS.AIMED_SHOT.id} /> and <SpellLink id={SPELLS.RAPID_FIRE.id} /> had their cooldown reduced by too much during <SpellLink id={SPELLS.TRUESHOT.id} /> or <SpellLink id={SPELLS.DEAD_EYE_TALENT.id} />.</>, Putro),
  change(date(2020, 12, 19), <> Fixed an issue where <SpellLink id={SPELLS.RAPID_FIRE.id} /> wouldn't show as channeling in the timeline tab.</>, Putro),
  change(date(2020, 12, 16), <> Fix an issue with <SpellLink id={SPELLS.BORN_TO_BE_WILD_TALENT.id} /> where it wouldn't load or register casts. </>, Putro),
  change(date(2020, 12, 15), 'Bumped level of support to 9.0.2', Putro),
  change(date(2020, 12, 10), <> Fixed an issue where the module tracking utilisation of <SpellLink id={SPELLS.PRECISE_SHOTS.id} /> was accidentally showing unused procs as the used amount of procs. </>, Putro),
  change(date(2020, 12, 4), <> Implement the 100% focus generation increase to focus generators from <SpellLink id={SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT.id} />. </>, Putro),
  change(date(2020, 11, 14), <> Implement the 50% focus generation increase from <SpellLink id={SPELLS.TRUESHOT.id} /> and lay initial groundwork for <SpellLink id={SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT.id} /> legendary.</>, Putro),
  change(date(2020, 11, 7), <> Added support for the four Marksmanship specific legendaries <SpellLink id={SPELLS.SERPENTSTALKERS_TRICKERY_EFFECT.id} />, <SpellLink id={SPELLS.SURGING_SHOTS_EFFECT.id} />, <SpellLink id={SPELLS.SECRETS_OF_THE_UNBLINKING_VIGIL_EFFECT.id} />, and <SpellLink id={SPELLS.EAGLETALONS_TRUE_FOCUS_EFFECT.id} />.</>, Putro),
  change(date(2020, 10, 18), 'Moved catchall event listeners to new filter', Zeboot),
  change(date(2020, 10, 13), 'Updated all Marksmanship modules for Shadowlands prepatch as well as adding a checklist', Putro),
];
