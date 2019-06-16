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
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.PREDATORY_SWIFTNESS.id,
        // only important for rotation when using Bloodtalons, but always available
        timelineHightlight: combatant.hasTalent(SPELLS.BLOODTALONS_TALENT),
      },
      {
        spellId: SPELLS.SAVAGE_ROAR_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT),
        timelineHightlight: true,
      },

      // defensive
      {
        spellId: SPELLS.SURVIVAL_INSTINCTS.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.BEAR_FORM.id,
        timelineHightlight: true,
      },

      // stealth
      {
        spellId: [SPELLS.PROWL.id, SPELLS.PROWL_INCARNATION.id],
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.SHADOWMELD.id,
        timelineHightlight: true,
      },

      // cooldowns
      {
        spellId: SPELLS.TIGERS_FURY.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.BERSERK.id,
        enabled: !combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT),
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT),
        timelineHightlight: true,
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map(item => Number(item)),
        timelineHightlight: true,
      },

      // utility
      {
        // it could be useful to see when the combatant is out of cat form, but filling the timeline with a nearly constant buff would add too much noise
        spellId: SPELLS.CAT_FORM.id,
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
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.STAG_FORM.id,
        timelineHightlight: true,
      },
      {
        spellId: SPELLS.DASH.id,
        enabled: !combatant.hasTalent(SPELLS.TIGER_DASH_TALENT),
      },
      {
        spellId: SPELLS.TIGER_DASH_TALENT.id,
        enabled: combatant.hasTalent(SPELLS.TIGER_DASH_TALENT),
      },
      {
        spellId: SPELLS.STAMPEDING_ROAR_CAT.id,
      },
      {
        spellId: SPELLS.STAMPEDING_ROAR_BEAR.id,
      },
      {
        spellId: SPELLS.REGROWTH.id,
      },
      {
        spellId: SPELLS.REJUVENATION.id,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT),
      },
      {
        spellId: SPELLS.WILD_GROWTH.id,
        enabled: combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT),
      },
    ];
  }
}

export default Buffs;
