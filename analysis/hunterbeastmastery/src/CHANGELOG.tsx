import { change, date } from 'common/changelog';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { Adoraci, Putro, Kartarn } from 'CONTRIBUTORS';
import { ItemLink, SpellLink } from 'interface';

export default [
  change(date(2021, 12, 31), <> Adjusted ExecuteHelper module to more accurately handle <SpellLink id={SPELLS.KILL_SHOT_MM_BM.id}/> when playing with <SpellLink id={SPELLS.FLAYED_SHOT.id}/>. </>, Putro),
  change(date(2021, 12, 26), <> Correct an error that was attributing too much damage to <SpellLink id={SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS.id}/> on rare occasions. </>, Putro),
  change(date(2021, 12, 26), <> Added a module that aims to simulate either <SpellLink id={SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT.id} /> or <SpellLink id={SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS.id} />, to provide a better comparison between the two for different bosses or dungeons, as it is a highly debated topic. </>, Putro),
  change(date(2021, 12, 12), <> Added <SpellLink id={SPELLS.WILD_SPIRITS_BUFF.id} />, <SpellLink id={SPELLS.RESONATING_ARROW_DAMAGE_AND_BUFF.id}/> and <SpellLink id={SPELLS.FLAYERS_MARK.id} /> to the timeline to better show when these covenant specifics buffs were active.</>, Putro),
  change(date(2021, 11, 11), <> Added a simple analyzer to track damage gained from <SpellLink id={SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS.id}/>. </>, Putro),
  change(date(2021, 11, 11), <> Correct an issue where damage done by <SpellLink id={SPELLS.BEAST_CLEAVE_DAMAGE.id}/> wasn't correctly attributed to <SpellLink id={SPELLS.RYLAKSTALKERS_PIERCING_FANGS_EFFECT.id}/>.  </>, Putro),
  change(date(2021, 11, 6), <> Update APL checker with the new fractional spell charges and cooldown remaining logic as well as moving <SpellLink id={SPELLS.WILD_SPIRITS.id} /> into the major cooldown category instead of an APL item. </>, Putro),
  change(date(2021, 11, 6), 'Implement an initial version of the APL checker', Putro),
  change(date(2021, 11, 5), <> Added support for <SpellLink id={SPELLS.WAILING_ARROW_CAST.id}/> as provided by <ItemLink id={ITEMS.RAESHALARE_DEATHS_WHISPER.id} />. </>, Putro),
  change(date(2021, 10, 31), <> Fix a bug with <SpellLink id={SPELLS.KILLER_INSTINCT_TALENT.id}/> that showed there were 0 casts in execute. </>, Putro),
  change(date(2021, 4, 3), <>Update <SpellLink id={SPELLS.QAPLA_EREDUN_WAR_ORDER_EFFECT.id} /> and other legendaries to 9.0.5. Bump support to 9.0.5.</>, Adoraci),
  change(date(2021, 3, 6), 'Fixed suggestion for wasted regenerated focus.', Kartarn),
  change(date(2021, 1, 16), 'Due to the paywalling of the timeline feature, and fundamental differences of opinion - I will no longer be updating this module beyond todays date. All the modules should be accurate for Castle Nathria, but will not be accurate going forward.', Putro),
  change(date(2021, 1, 16), <> Added support for <SpellLink id={SPELLS.REVERSAL_OF_FORTUNE_CONDUIT.id} />, <SpellLink id={SPELLS.REJUVENATING_WIND_CONDUIT.id} /> and <SpellLink id={SPELLS.HARMONY_OF_THE_TORTOLLAN_CONDUIT.id} />. </>, Putro),
  change(date(2021, 1, 10), <> Adjusted <SpellLink id={SPELLS.WILD_SPIRITS.id}/> global cooldown to correctly be reduced by haste twice in the analyzer, to reflect behaviour in-game. </>, Putro),
  change(date(2021, 1, 8), <> Correct an issue where if <SpellLink id={SPELLS.HUNTERS_MARK.id} /> was applied before combat and never dropped, <SpellLink id={SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id} /> would never be attributed any damage. </>, Putro),
  change(date(2021, 1, 3), <> Added support for <SpellLink id={SPELLS.MARKMANS_ADVANTAGE_CONDUIT.id} /> and <SpellLink id={SPELLS.RESILIENCE_OF_THE_HUNTER_CONDUIT.id} />. </>, Putro),
  change(date(2020, 12, 19), <> Added a usage requirement to <SpellLink id={SPELLS.FLARE.id} /> and <SpellLink id={SPELLS.TAR_TRAP.id} /> when using <SpellLink id={SPELLS.SOULFORGE_EMBERS_EFFECT.id} /> </>, Putro),
  change(date(2020, 12, 19), <> Fixed an issue where <SpellLink id={SPELLS.BARRAGE_TALENT.id} /> wouldn't show as channeling in the timeline tab.</>, Putro),
  change(date(2020, 12, 16), <> Fix an issue with <SpellLink id={SPELLS.BORN_TO_BE_WILD_TALENT.id} /> where it wouldn't load or register casts. </>, Putro),
  change(date(2020, 12, 15), 'Bumped level of support to 9.0.2', Putro),
  change(date(2020, 12, 12), 'Fix translation library causing suggestions not showing correct values', Putro),
  change(date(2020, 12, 4), <> Implement the 100% focus generation increase to focus generators from <SpellLink id={SPELLS.NESINGWARYS_TRAPPING_APPARATUS_EFFECT.id} />. </>, Putro),
  change(date(2020, 10, 1), 'Updated all Beast Mastery modules for Shadowlands', Putro),
];
