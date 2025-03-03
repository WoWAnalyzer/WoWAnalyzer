import POTIONS from 'common/SPELLS/thewarwithin/potions';
import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import { SpellbookAura } from 'parser/core/modules/Aura';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const hasTalent = this.selectedCombatant.hasTalent.bind(this.selectedCombatant);

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
      {
        spellId: Object.values(POTIONS).map(({ id }) => id),
        timelineHighlight: true,
      },

      {
        spellId: SPELLS.ENRAGE.id,
        enabled:
          hasTalent(TALENTS.RAMPAGE_TALENT) ||
          hasTalent(TALENTS.BLOODTHIRST_TALENT) ||
          hasTalent(TALENTS.ONSLAUGHT_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: [SPELLS.RAMPAGE.id, SPELLS.BLOODTHIRST.id, SPELLS.ONSLAUGHT.id],
      },
      {
        spellId: SPELLS.FRENZY.id,
        enabled: hasTalent(TALENTS.FRENZY_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.RAMPAGE.id,
      },
      {
        spellId: SPELLS.RECKLESSNESS.id,
        enabled:
          hasTalent(TALENTS.RECKLESSNESS_TALENT) || hasTalent(TALENTS.BERSERKERS_TORMENT_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: hasTalent(TALENTS.BERSERKERS_TORMENT_TALENT)
          ? [SPELLS.AVATAR_SHARED.id, SPELLS.RECKLESSNESS.id]
          : [SPELLS.RECKLESSNESS.id],
      },
      {
        spellId: SPELLS.AVATAR_SHARED.id,
        enabled: hasTalent(TALENTS.AVATAR_TALENT),
        timelineHighlight: true,
        triggeredBySpellId: hasTalent(TALENTS.BERSERKERS_TORMENT_TALENT)
          ? [SPELLS.RECKLESSNESS.id, SPELLS.AVATAR_SHARED.id]
          : [SPELLS.AVATAR_SHARED.id],
      },
    ] satisfies SpellbookAura[];
  }
}

export default Buffs;
