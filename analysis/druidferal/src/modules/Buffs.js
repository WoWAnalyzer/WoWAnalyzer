import SPELLS from 'common/SPELLS';
import CoreBuffs from 'parser/core/modules/Buffs';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';

class Buffs extends CoreBuffs {
  buffs() {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      // rotational
      {
        spellId: SPELLS.BLOODTALONS_BUFF.id,
        enabled: combatant.hasTalent(SPELLS.BLOODTALONS_TALENT),
        triggeredBySpellId: [SPELLS.REGROWTH.id, SPELLS.ENTANGLING_ROOTS.id],
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.PREDATORY_SWIFTNESS.id,
        // only important for rotation when using Bloodtalons, but always available
        timelineHighlight: combatant.hasTalent(SPELLS.BLOODTALONS_TALENT),
      },
      {
        spellId: SPELLS.SAVAGE_ROAR_TALENT.id,
        triggeredBySpellId: SPELLS.SAVAGE_ROAR_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT),
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
        spellId: SPELLS.BERSERK.id,
        triggeredBySpellId: SPELLS.BERSERK.id,
        enabled: !combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id,
        triggeredBySpellId: SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT),
        timelineHighlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHighlight: true,
      },

      // utility
      {
        // it could be useful to see when the combatant is out of cat form, but filling the timeline with a nearly constant buff would add too much noise
        spellId: SPELLS.CAT_FORM.id,
        triggeredBySpellId: SPELLS.CAT_FORM.id,
      },
      {
        spellId: SPELLS.MOONKIN_FORM_AFFINITY.id,
        enabled: combatant.hasTalent(SPELLS.BALANCE_AFFINITY_TALENT_SHARED),
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
        enabled: !combatant.hasTalent(SPELLS.TIGER_DASH_TALENT),
      },
      {
        spellId: SPELLS.TIGER_DASH_TALENT.id,
        triggeredBySpellId: SPELLS.TIGER_DASH_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.TIGER_DASH_TALENT),
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
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT),
      },
      {
        spellId: SPELLS.WILD_GROWTH.id,
        triggeredBySpellId: SPELLS.WILD_GROWTH.id,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT),
      },
    ];
  }
}

export default Buffs;
