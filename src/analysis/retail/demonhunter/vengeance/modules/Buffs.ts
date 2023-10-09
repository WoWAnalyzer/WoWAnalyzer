import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';
import { SpellbookAura } from 'parser/core/modules/Aura';

class Buffs extends CoreAuras {
  static dependencies = {
    ...CoreAuras.dependencies,
  };

  auras(): SpellbookAura[] {
    const combatant = this.selectedCombatant;

    // This should include ALL buffs that can be applied by your spec.
    // This data can be used by various kinds of modules to improve their results, and modules added in the future may rely on buffs that aren't used today.
    return [
      {
        spellId: SPELLS.METAMORPHOSIS_TANK.id,
        triggeredBySpellId: SPELLS.METAMORPHOSIS_TANK.id,
        timelineHighlight: true,
      },
      {
        spellId: SPELLS.FIERY_BRAND_DOT.id,
        triggeredBySpellId: TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.FIERY_BRAND_TALENT),
        timelineHighlight: true,
      },
      // TODO: Collapse these
      {
        spellId: SPELLS.FRAILTY.id,
        triggeredBySpellId: TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SPIRIT_BOMB_TALENT),
      },
      {
        spellId: SPELLS.FRAILTY.id,
        triggeredBySpellId: SPELLS.SOUL_CLEAVE.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.VOID_REAVER_TALENT),
      },
      {
        spellId: SPELLS.FRAILTY.id,
        triggeredBySpellId: SPELLS.SIGIL_OF_FLAME_PRECISE.id,
        enabled:
          combatant.hasTalent(TALENTS_DEMON_HUNTER.FRAILTY_TALENT) &&
          combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT),
      },
      {
        spellId: SPELLS.FRAILTY.id,
        triggeredBySpellId: SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id,
        enabled:
          combatant.hasTalent(TALENTS_DEMON_HUNTER.FRAILTY_TALENT) &&
          combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT),
      },
      {
        spellId: SPELLS.FRAILTY.id,
        triggeredBySpellId: SPELLS.SIGIL_OF_FLAME.id,
        enabled:
          combatant.hasTalent(TALENTS_DEMON_HUNTER.FRAILTY_TALENT) &&
          !(
            combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT) ||
            combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT)
          ),
      },
      {
        spellId: SPELLS.SIGIL_OF_FLAME_DEBUFF.id,
        triggeredBySpellId: SPELLS.SIGIL_OF_FLAME_PRECISE.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT),
      },
      {
        spellId: SPELLS.SIGIL_OF_FLAME_DEBUFF.id,
        triggeredBySpellId: SPELLS.SIGIL_OF_FLAME_CONCENTRATED.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT),
      },
      {
        spellId: SPELLS.SIGIL_OF_FLAME_DEBUFF.id,
        triggeredBySpellId: SPELLS.SIGIL_OF_FLAME.id,
        enabled: !(
          combatant.hasTalent(TALENTS_DEMON_HUNTER.PRECISE_SIGILS_TALENT) ||
          combatant.hasTalent(TALENTS_DEMON_HUNTER.CONCENTRATED_SIGILS_TALENT)
        ),
      },
      {
        spellId: TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.id,
        triggeredBySpellId: TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.SOUL_BARRIER_TALENT),
      },
      {
        spellId: TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id,
        triggeredBySpellId: TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.DARKNESS_TALENT),
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
