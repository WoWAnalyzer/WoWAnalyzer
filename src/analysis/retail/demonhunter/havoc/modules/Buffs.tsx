import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import CoreAuras from 'parser/core/modules/Auras';

class Buffs extends CoreAuras {
  auras() {
    const combatant = this.selectedCombatant;

    return [
      {
        spellId: SPELLS.CHAOS_THEORY_BUFF.id, //Chaos Theory Legendary
        timelineHighlight: true,
        triggeredBySpellId: [SPELLS.DEATH_SWEEP.id, SPELLS.BLADE_DANCE.id],
      },
      {
        spellId: SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.METAMORPHOSIS_HAVOC.id,
      },
      {
        spellId: SPELLS.IMMOLATION_AURA.id,
        timelineHighlight: true,
        triggeredBySpellId: SPELLS.IMMOLATION_AURA.id,
      },
      {
        spellId: TALENTS_DEMON_HUNTER.FELBLADE_TALENT.id,
        timelineHighlight: false,
        triggeredBySpellId: TALENTS_DEMON_HUNTER.FELBLADE_TALENT.id,
      },
      {
        spellId: SPELLS.BLUR_BUFF.id,
        triggeredBySpellId: SPELLS.BLUR.id,
      },
      {
        spellId: TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id,
        triggeredBySpellId: TALENTS_DEMON_HUNTER.DARKNESS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.DARKNESS_TALENT),
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
        spellId: TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_TALENT.id,
        triggeredBySpellId: TALENTS_DEMON_HUNTER.VENGEFUL_RETREAT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_DEMON_HUNTER.TACTICAL_RETREAT_TALENT),
      },
      {
        spellId: Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)),
        timelineHighlight: true,
      },
    ];
  }
}

export default Buffs;
