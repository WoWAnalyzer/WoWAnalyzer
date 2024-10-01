import SPELLS from 'common/SPELLS';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import { TALENTS_DRUID } from 'common/TALENTS';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      // rotational
      {
        spellId: SPELLS.BLOODTALONS_BUFF.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.BLOODTALONS_TALENT),
        triggeredBySpellId: [SPELLS.REGROWTH.id, SPELLS.ENTANGLING_ROOTS.id],
        timelineHighlight: true,
      },

      // defensive
      {
        spellId: SPELLS.SURVIVAL_INSTINCTS.id,
        triggeredBySpellId: SPELLS.SURVIVAL_INSTINCTS.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BEAR_FORM.id,
        triggeredBySpellId: SPELLS.BEAR_FORM.id,
        timelineHighlight: true,
      },

      // stealth
      {
        spellId: [SPELLS.PROWL.id, SPELLS.PROWL_INCARNATION.id],
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.SHADOWMELD.id,
        triggeredBySpellId: SPELLS.SHADOWMELD.id,
        timelineHighlight: true,
      },

      // cooldowns
      {
        spellId: SPELLS.TIGERS_FURY.id,
        triggeredBySpellId: SPELLS.TIGERS_FURY.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.BERSERK_CAT.id,
        triggeredBySpellId: SPELLS.BERSERK_CAT.id,
        enabled: !combatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id,
        triggeredBySpellId: TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },

      // utility
      {
        // it could be useful to see when the combatant is out of cat form, but filling the timeline with a nearly constant buff would add too much noise
        spellId: SPELLS.CAT_FORM.id,
        triggeredBySpellId: SPELLS.CAT_FORM.id,
      },
      {
        spellId: SPELLS.TREANT_FORM.id,
      },
      {
        spellId: SPELLS.TRAVEL_FORM.id,
        triggeredBySpellId: SPELLS.TRAVEL_FORM.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.STAG_FORM.id,
        triggeredBySpellId: SPELLS.STAG_FORM.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.DASH.id,
        triggeredBySpellId: SPELLS.DASH.id,
        enabled: !combatant.hasTalent(TALENTS_DRUID.TIGER_DASH_TALENT),
      },
      {
        spellId: TALENTS_DRUID.TIGER_DASH_TALENT.id,
        triggeredBySpellId: TALENTS_DRUID.TIGER_DASH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.TIGER_DASH_TALENT),
      },
      {
        spellId: SPELLS.STAMPEDING_ROAR_CAT.id,
        triggeredBySpellId: SPELLS.STAMPEDING_ROAR_CAT.id,
      },
      {
        spellId: SPELLS.STAMPEDING_ROAR_BEAR.id,
        triggeredBySpellId: SPELLS.STAMPEDING_ROAR_BEAR.id,
      },
      {
        spellId: SPELLS.REGROWTH.id,
        //triggeredBySpellId: SPELLS.REGROWTH.id
        // disabled triggeredBySpellId for Regrowth as it causes the PrePullCooldowns normalizer to generate excessive Regrowth casts events before the pull: one for Regrowth and one for the Bloodtalons buff, but in reality a single cast produces both effects.
      },
      {
        spellId: SPELLS.REJUVENATION.id,
        triggeredBySpellId: SPELLS.REJUVENATION.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.REJUVENATION_TALENT),
      },
      {
        spellId: SPELLS.WILD_GROWTH.id,
        triggeredBySpellId: SPELLS.WILD_GROWTH.id,
        enabled: combatant.hasTalent(TALENTS_DRUID.WILD_GROWTH_TALENT),
      },
    ];
  }
}

export default Buffs;
