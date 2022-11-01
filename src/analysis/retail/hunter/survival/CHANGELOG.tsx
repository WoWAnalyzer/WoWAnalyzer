import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { Adoraci, Putro, Kartarn, Abelito75, Arlie } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 11, 1), 'Updated all Survival modules for Dragonflight', Arlie),
  change(date(2022, 5, 23), <> Fixed an issue with <SpellLink id={SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id}/> to prevent it from crashing. </>, Abelito75),
  change(date(2021, 12, 31), <> Adjusted ExecuteHelper module to more accurately handle <SpellLink id={SPELLS.KILL_SHOT_SV.id}/> when playing with <SpellLink id={SPELLS.FLAYED_SHOT.id}/>. </>, Putro),
  change(date(2021, 12, 12), <> Added <SpellLink id={SPELLS.WILD_SPIRITS_BUFF.id} />, <SpellLink id={SPELLS.RESONATING_ARROW_DAMAGE_AND_BUFF.id}/> and <SpellLink id={SPELLS.FLAYERS_MARK.id} /> to the timeline to better show when these covenant specifics buffs were active.</>, Putro),
  change(date(2021, 11, 11), <> Added a simple analyzer to track damage gained from <SpellLink id={SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS.id}/>. </>, Putro),
  change(date(2021, 4, 3), 'Verified 9.0.5 patch changes and bumped support to 9.0.5', Adoraci),
  change(date(2021, 3, 6), 'Fixed suggestion for wasted regenerated focus.', Kartarn),
  change(date(2021, 1, 16), 'Due to the paywalling of the timeline feature, and fundamental differences of opinion - I will no longer be updating this module beyond todays date. All the modules should be accurate for Castle Nathria, but will not be accurate going forward.', Putro),
  change(date(2021, 1, 16), <> Added support for <SpellLink id={SPELLS.LATENT_POISON_INJECTORS_EFFECT.id} />, <SpellLink id={SPELLS.RYLAKSTALKERS_CONFOUNDING_STRIKES_EFFECT.id} /> and <SpellLink id={SPELLS.BUTCHERS_BONE_FRAGMENTS_EFFECT.id} />. </>, Putro),
  change(date(2021, 1, 16), <> Added support for <SpellLink id={SPELLS.REVERSAL_OF_FORTUNE_CONDUIT.id} />, <SpellLink id={SPELLS.REJUVENATING_WIND_CONDUIT.id} /> and <SpellLink id={SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id} />. </>, Putro),
  change(date(2021, 1, 10), <> Adjusted <SpellLink id={SPELLS.WILD_SPIRITS.id} /> global cooldown to correctly be reduced by haste twice in the analyzer, to reflect behaviour in-game. </>, Putro),
  change(date(2021, 1, 8), <> Correct an issue where if <SpellLink id={SPELLS.HUNTERS_MARK.id} /> was applied before combat and never dropped, <SpellLink id={SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id} /> would never be attributed any damage. </>, Putro),
  change(date(2021, 1, 3), <> Added support for <SpellLink id={SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id} /> and <SpellLink id={SPELLS.RESILIENCE_OF_THE_HUNTER_CONDUIT.id} />. </>, Putro),
  change(date(2020, 12, 19), <> Added a usage requirement to <SpellLink id={SPELLS.FLARE.id} /> and <SpellLink id={SPELLS.TAR_TRAP.id} /> when using <SpellLink id={SPELLS.SOULFORGE_EMBERS_EFFECT.id} /> </>, Putro),
  change(date(2020, 12, 16), <> Fix an issue with <SpellLink id={TALENTS.BORN_TO_BE_WILD_TALENT.id} /> where it wouldn't load or register casts. </>, Putro),
  change(date(2020, 12, 15), 'Bumped level of support to 9.0.2', Putro),
  change(date(2020, 12, 4), <> Implement the 100% focus generation increase to focus generators from <SpellLink id={SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT.id} />. </>, Putro),
  change(date(2020, 10, 1), 'Updated all Survival modules for Shadowlands', Putro),
];
